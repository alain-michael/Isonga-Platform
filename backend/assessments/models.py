from django.db import models
from django.contrib.auth import get_user_model
from enterprises.models import Enterprise

User = get_user_model()

class AssessmentCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)  # Weight for scoring
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Assessment Categories"

class Questionnaire(models.Model):
    LANGUAGES = (
        ('en', 'English'),
        ('rw', 'Kinyarwanda'),
        ('fr', 'French'),
        ('sw', 'Swahili'),
    )
    
    ENTERPRISE_SIZES = (
        ('micro', 'Micro (1-9 employees)'),
        ('small', 'Small (10-49 employees)'),
        ('medium', 'Medium (50-249 employees)'),
        ('large', 'Large (250+ employees)'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(AssessmentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='questionnaires')
    version = models.CharField(max_length=10, default='1.0')
    language = models.CharField(max_length=5, choices=LANGUAGES, default='en')
    is_active = models.BooleanField(default=True)
    
    # Enterprise matching criteria
    target_sectors = models.JSONField(default=list, blank=True, help_text="List of sectors this questionnaire is for. Empty means all sectors.")
    target_enterprise_sizes = models.JSONField(default=list, blank=True, help_text="List of enterprise sizes. Empty means all sizes.")
    target_districts = models.JSONField(default=list, blank=True, help_text="List of districts. Empty means all districts.")
    min_employees = models.PositiveIntegerField(null=True, blank=True, help_text="Minimum number of employees")
    max_employees = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum number of employees")
    
    # Time estimation (in minutes)
    estimated_time_minutes = models.PositiveIntegerField(default=0, help_text="Estimated completion time in minutes")
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} v{self.version} ({self.get_language_display()})"
    
    def calculate_estimated_time(self):
        """Calculate estimated time based on number of questions (3 minutes per question)"""
        question_count = self.questions.count()
        self.estimated_time_minutes = question_count * 3
        self.save(update_fields=['estimated_time_minutes'])
        return self.estimated_time_minutes
    
    def matches_enterprise(self, enterprise):
        """Check if this questionnaire matches the given enterprise criteria"""
        # If no criteria set, matches all enterprises
        if not self.target_sectors and not self.target_enterprise_sizes and not self.target_districts:
            return True
        
        matches = True
        
        # Check sector
        if self.target_sectors and enterprise.sector not in self.target_sectors:
            matches = False
        
        # Check enterprise size
        if self.target_enterprise_sizes and enterprise.enterprise_size not in self.target_enterprise_sizes:
            matches = False
        
        # Check district
        if self.target_districts and enterprise.district not in self.target_districts:
            matches = False
        
        # Check employee count
        if self.min_employees and enterprise.number_of_employees < self.min_employees:
            matches = False
        
        if self.max_employees and enterprise.number_of_employees > self.max_employees:
            matches = False
        
        return matches

class Question(models.Model):
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('single_choice', 'Single Choice'),
        ('text', 'Text'),
        ('number', 'Number'),
        ('file_upload', 'File Upload'),
        ('scale', 'Scale (1-10)'),
    )
    
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='questions')
    category = models.ForeignKey(AssessmentCategory, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField(default=10)
    
    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."
    
    class Meta:
        ordering = ['order']

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    score = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.question.text[:30]}... - {self.text}"
    
    class Meta:
        ordering = ['order']

class Assessment(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('reviewed', 'Reviewed'),
    )
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='assessments')
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE)
    fiscal_year = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Scoring
    total_score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_possible_score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    percentage_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamps
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_assessments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.enterprise.business_name} - {self.fiscal_year} Assessment"
    
    class Meta:
        unique_together = ['enterprise', 'questionnaire', 'fiscal_year']
        ordering = ['-created_at']

class AssessmentResponse(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.ManyToManyField(QuestionOption, blank=True)
    text_response = models.TextField(blank=True, null=True)
    number_response = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    file_response = models.FileField(upload_to='assessment_files/', blank=True, null=True)
    score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.assessment} - Q{self.question.order}"

class CategoryScore(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='category_scores')
    category = models.ForeignKey(AssessmentCategory, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.assessment} - {self.category.name}: {self.percentage}%"

class Recommendation(models.Model):
    PRIORITY_LEVELS = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='recommendations')
    category = models.ForeignKey(AssessmentCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS)
    suggested_actions = models.TextField()
    
    def __str__(self):
        return f"{self.assessment} - {self.title}"
