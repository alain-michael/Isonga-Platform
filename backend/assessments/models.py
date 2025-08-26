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
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    version = models.CharField(max_length=10, default='1.0')
    language = models.CharField(max_length=5, choices=LANGUAGES, default='en')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} v{self.version} ({self.get_language_display()})"

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
