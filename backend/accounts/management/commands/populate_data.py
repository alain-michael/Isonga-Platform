from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import User
from enterprises.models import Enterprise, EnterpriseDocument
from assessments.models import AssessmentCategory, Questionnaire, Question, QuestionOption, Assessment, AssessmentResponse
from payments.models import SubscriptionPlan, Subscription, Payment
import random
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            # Clear in reverse order of dependencies
            AssessmentResponse.objects.all().delete()
            Assessment.objects.all().delete()
            QuestionOption.objects.all().delete()
            Question.objects.all().delete()
            Questionnaire.objects.all().delete()
            AssessmentCategory.objects.all().delete()
            Payment.objects.all().delete()
            Subscription.objects.all().delete()
            SubscriptionPlan.objects.all().delete()
            Enterprise.objects.all().delete()
            User.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write('Creating sample data...')

        # Create admin users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@isonga.rw',
                'first_name': 'System',
                'last_name': 'Administrator',
                'user_type': 'admin',
                'is_staff': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # Create enterprise users and their enterprises
        enterprises_data = [
            {
                'user': {
                    'username': 'techcorp',
                    'email': 'admin@techcorp.rw',
                    'first_name': 'John',
                    'last_name': 'Uwimana',
                    'password': 'password123'
                },
                'enterprise': {
                    'business_name': 'TechCorp Solutions Ltd',
                    'tin_number': 'TIN123456789',
                    'registration_number': 'REG2023001',
                    'enterprise_type': 'limited_company',
                    'enterprise_size': 'medium',
                    'sector': 'technology',
                    'address': 'KG 15 Ave, Kacyiru',
                    'city': 'Kigali',
                    'district': 'Gasabo',
                    'phone': '+250788123456',
                    'email': 'info@techcorp.rw',
                    'website': 'https://techcorp.rw',
                    'year_established': 2020,
                    'number_of_employees': 45,
                    'annual_revenue': 500000000,
                    'description': 'Leading technology solutions provider specializing in software development and digital transformation.',
                    'is_vetted': True
                }
            },
            {
                'user': {
                    'username': 'greenenergy',
                    'email': 'ceo@greenenergy.rw',
                    'first_name': 'Marie',
                    'last_name': 'Mukamana',
                    'password': 'password123'
                },
                'enterprise': {
                    'business_name': 'GreenEnergy Solutions Rwanda',
                    'tin_number': 'TIN987654321',
                    'registration_number': 'REG2023002',
                    'enterprise_type': 'limited_company',
                    'enterprise_size': 'medium',
                    'sector': 'other',
                    'address': 'KG 10 Ave, Kimisagara',
                    'city': 'Kigali',
                    'district': 'Nyarugenge',
                    'phone': '+250788987654',
                    'email': 'info@greenenergy.rw',
                    'website': 'https://greenenergy.rw',
                    'year_established': 2019,
                    'number_of_employees': 78,
                    'annual_revenue': 750000000,
                    'description': 'Renewable energy solutions for sustainable development in Rwanda.',
                    'is_vetted': True
                }
            },
            {
                'user': {
                    'username': 'localcafe',
                    'email': 'owner@localcafe.rw',
                    'first_name': 'Pierre',
                    'last_name': 'Nkurunziza',
                    'password': 'password123'
                },
                'enterprise': {
                    'business_name': 'Local Cafe Chain',
                    'tin_number': 'TIN456789123',
                    'registration_number': 'REG2023003',
                    'enterprise_type': 'limited_company',
                    'enterprise_size': 'small',
                    'sector': 'services',
                    'address': 'KG 5 Ave, Kimisagara',
                    'city': 'Kigali',
                    'district': 'Nyarugenge',
                    'phone': '+250788456789',
                    'email': 'info@localcafe.rw',
                    'website': 'https://localcafe.rw',
                    'year_established': 2021,
                    'number_of_employees': 23,
                    'annual_revenue': 150000000,
                    'description': 'Premium coffee chain promoting Rwandan coffee culture.',
                    'is_vetted': False
                }
            },
            {
                'user': {
                    'username': 'autoparts',
                    'email': 'manager@autoparts.rw',
                    'first_name': 'David',
                    'last_name': 'Kamanzi',
                    'password': 'password123'
                },
                'enterprise': {
                    'business_name': 'AutoParts Manufacturing Ltd',
                    'tin_number': 'TIN789123456',
                    'registration_number': 'REG2023004',
                    'enterprise_type': 'limited_company',
                    'enterprise_size': 'medium',
                    'sector': 'manufacturing',
                    'address': 'KG 20 Ave, Gikondo',
                    'city': 'Kigali',
                    'district': 'Kicukiro',
                    'phone': '+250788789123',
                    'email': 'info@autoparts.rw',
                    'year_established': 2018,
                    'number_of_employees': 156,
                    'annual_revenue': 1200000000,
                    'description': 'Automotive parts manufacturing and distribution.',
                    'is_vetted': True
                }
            },
            {
                'user': {
                    'username': 'digitalmarketing',
                    'email': 'ceo@digitalmarketing.rw',
                    'first_name': 'Sarah',
                    'last_name': 'Nyirahabimana',
                    'password': 'password123'
                },
                'enterprise': {
                    'business_name': 'Digital Marketing Hub',
                    'tin_number': 'TIN321654987',
                    'registration_number': 'REG2023005',
                    'enterprise_type': 'limited_company',
                    'enterprise_size': 'small',
                    'sector': 'services',
                    'address': 'KG 7 Ave, Kacyiru',
                    'city': 'Kigali',
                    'district': 'Gasabo',
                    'phone': '+250788321654',
                    'email': 'info@digitalmarketing.rw',
                    'website': 'https://digitalmarketing.rw',
                    'year_established': 2022,
                    'number_of_employees': 12,
                    'annual_revenue': 80000000,
                    'description': 'Digital marketing and advertising solutions for modern businesses.',
                    'is_vetted': False
                }
            }
        ]

        created_enterprises = []
        for data in enterprises_data:
            # Create user
            user = User.objects.create_user(
                username=data['user']['username'],
                email=data['user']['email'],
                password=data['user']['password'],
                first_name=data['user']['first_name'],
                last_name=data['user']['last_name'],
                user_type='enterprise'
            )

            # Create enterprise
            enterprise = Enterprise.objects.create(
                user=user,
                **data['enterprise']
            )
            created_enterprises.append(enterprise)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_enterprises)} enterprises.'))

        # Create assessment categories
        categories_data = [
            {
                'name': 'Financial Assessment',
                'description': 'Evaluate financial health and sustainability',
                'weight': 0.3
            },
            {
                'name': 'Operations Assessment',
                'description': 'Assess operational efficiency and processes',
                'weight': 0.25
            },
            {
                'name': 'Market Analysis',
                'description': 'Analyze market position and competitive advantage',
                'weight': 0.2
            },
            {
                'name': 'Leadership & Management',
                'description': 'Evaluate leadership capabilities and management structure',
                'weight': 0.15
            },
            {
                'name': 'Innovation & Technology',
                'description': 'Assess innovation capacity and technology adoption',
                'weight': 0.1
            }
        ]

        created_categories = []
        for cat_data in categories_data:
            category = AssessmentCategory.objects.create(**cat_data)
            created_categories.append(category)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_categories)} categories.'))

        # Create questionnaires
        questionnaires_data = [
            {
                'title': 'Financial Health Questionnaire',
                'description': 'Comprehensive financial assessment questionnaire',
                'version': '1.0',
                'language': 'en',
                'is_active': True,
                'created_by': admin_user
            },
            {
                'title': 'Operations Efficiency Questionnaire',
                'description': 'Operational processes and efficiency evaluation',
                'version': '1.0',
                'language': 'en',
                'is_active': True,
                'created_by': admin_user
            },
            {
                'title': 'Market Position Assessment',
                'description': 'Market analysis and competitive positioning',
                'version': '1.0',
                'language': 'en',
                'is_active': True,
                'created_by': admin_user
            }
        ]

        created_questionnaires = []
        for quest_data in questionnaires_data:
            questionnaire = Questionnaire.objects.create(**quest_data)
            created_questionnaires.append(questionnaire)

        # Create questions for each questionnaire
        questions_data = {
            0: [  # Financial Health Questionnaire
                {
                    'text': 'What is your company\'s annual revenue?',
                    'question_type': 'multiple_choice',
                    'options': ['Less than $100K', '$100K - $500K', '$500K - $1M', 'More than $1M'],
                    'weight': 0.3
                },
                {
                    'text': 'How many months of operating expenses do you have in cash reserves?',
                    'question_type': 'multiple_choice',
                    'options': ['Less than 1 month', '1-3 months', '3-6 months', 'More than 6 months'],
                    'weight': 0.25
                },
                {
                    'text': 'What is your debt-to-equity ratio?',
                    'question_type': 'multiple_choice',
                    'options': ['Less than 0.3', '0.3 - 0.6', '0.6 - 1.0', 'More than 1.0'],
                    'weight': 0.2
                }
            ],
            1: [  # Operations Efficiency Questionnaire
                {
                    'text': 'How would you rate your operational efficiency?',
                    'question_type': 'scale',
                    'scale_min': 1,
                    'scale_max': 10,
                    'weight': 0.3
                },
                {
                    'text': 'Do you have documented standard operating procedures?',
                    'question_type': 'yes_no',
                    'weight': 0.25
                },
                {
                    'text': 'How often do you review and optimize your processes?',
                    'question_type': 'multiple_choice',
                    'options': ['Never', 'Annually', 'Quarterly', 'Monthly'],
                    'weight': 0.2
                }
            ],
            2: [  # Market Position Assessment
                {
                    'text': 'What is your market share in your primary market?',
                    'question_type': 'multiple_choice',
                    'options': ['Less than 5%', '5% - 15%', '15% - 30%', 'More than 30%'],
                    'weight': 0.3
                },
                {
                    'text': 'How many direct competitors do you have?',
                    'question_type': 'multiple_choice',
                    'options': ['More than 10', '5-10', '2-4', '1 or none'],
                    'weight': 0.25
                }
            ]
        }

        created_questions = []
        for quest_idx, questions in questions_data.items():
            questionnaire = created_questionnaires[quest_idx]
            category = created_categories[quest_idx]  # Use same index for category
            for idx, question_data in enumerate(questions):
                # Separate options and unsupported fields from question data
                options = question_data.pop('options', [])
                question_data.pop('weight', None)  # Remove weight as it's not in the model
                question_data.pop('scale_min', None)  # Remove scale_min
                question_data.pop('scale_max', None)  # Remove scale_max
                
                # Fix question types that don't exist in the model
                if question_data.get('question_type') == 'yes_no':
                    question_data['question_type'] = 'single_choice'
                    if not options:
                        options = ['Yes', 'No']
                
                question = Question.objects.create(
                    questionnaire=questionnaire,
                    category=category,
                    order=idx + 1,
                    **question_data
                )
                
                # Create options for multiple choice questions
                if options:
                    for opt_idx, option_text in enumerate(options):
                        QuestionOption.objects.create(
                            question=question,
                            text=option_text,
                            score=len(options) - opt_idx,  # Higher score for better options
                            order=opt_idx + 1
                        )
                
                created_questions.append(question)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_questions)} questions.'))

        # Create assessments for some enterprises
        created_assessments = []
        for i, enterprise in enumerate(created_enterprises[:3]):  # Create assessments for first 3 enterprises
            for j, questionnaire in enumerate(created_questionnaires):
                if random.random() > 0.3:  # 70% chance to have an assessment
                    status_choices = ['draft', 'in_progress', 'completed', 'reviewed']
                    status = random.choice(status_choices)
                    
                    assessment = Assessment.objects.create(
                        enterprise=enterprise,
                        questionnaire=questionnaire,
                        fiscal_year=2024,
                        status=status,
                        total_score=random.randint(60, 95) if status in ['completed', 'reviewed'] else 0,
                        max_possible_score=100,
                        percentage_score=random.randint(60, 95) if status in ['completed', 'reviewed'] else 0,
                        reviewed_by=admin_user if status == 'reviewed' else None
                    )
                    created_assessments.append(assessment)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_assessments)} assessments.'))

        # Create subscription plans
        plans_data = [
            {
                'name': 'Basic Plan',
                'description': 'Basic assessment features for small enterprises',
                'price': 29.99,
                'duration_months': 1,
                'features': ['Basic assessments', 'Email support', 'Basic reporting']
            },
            {
                'name': 'Professional Plan',
                'description': 'Advanced features for growing businesses',
                'price': 79.99,
                'duration_months': 1,
                'features': ['All assessments', 'Priority support', 'Advanced reporting', 'Custom questionnaires']
            },
            {
                'name': 'Enterprise Plan',
                'description': 'Full featured plan for large enterprises',
                'price': 199.99,
                'duration_months': 1,
                'features': ['Unlimited assessments', '24/7 support', 'Custom reporting', 'API access', 'Dedicated account manager']
            }
        ]

        created_plans = []
        for plan_data in plans_data:
            plan = SubscriptionPlan.objects.create(**plan_data)
            created_plans.append(plan)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_plans)} subscription plans.'))

        # Create some subscriptions and payments
        created_subscriptions = []
        created_payments = []
        for i, enterprise in enumerate(created_enterprises[:4]):  # First 4 enterprises have subscriptions
            plan = random.choice(created_plans)
            
            subscription = Subscription.objects.create(
                enterprise=enterprise,
                plan=plan,
                start_date=timezone.now() - timedelta(days=random.randint(1, 30)),
                end_date=timezone.now() + timedelta(days=random.randint(30, 365)),
                status='active'
            )
            created_subscriptions.append(subscription)

            # Create payment for this subscription
            payment = Payment.objects.create(
                enterprise=enterprise,
                subscription=subscription,
                amount=plan.price,
                payment_method='stripe',
                status='completed',
                transaction_reference=f'TXN_{random.randint(100000, 999999)}'
            )
            created_payments.append(payment)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_subscriptions)} subscriptions.'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(created_payments)} payments.'))

        # Create some sample documents for enterprises
        documents_data = [
            {
                'enterprise': created_enterprises[0],  # TechCorp
                'document_type': 'registration_certificate',
                'title': 'Certificate of Incorporation',
                'fiscal_year': 2024,
                'description': 'Official registration certificate from RDB',
                'is_verified': True
            },
            {
                'enterprise': created_enterprises[0],  # TechCorp
                'document_type': 'tax_clearance',
                'title': 'Tax Clearance Certificate 2024',
                'fiscal_year': 2024,
                'description': 'Tax clearance from Rwanda Revenue Authority',
                'is_verified': True
            },
            {
                'enterprise': created_enterprises[1],  # GreenEnergy
                'document_type': 'registration_certificate',
                'title': 'Business Registration Certificate',
                'fiscal_year': 2024,
                'description': 'Company registration documents',
                'is_verified': False
            },
            {
                'enterprise': created_enterprises[1],  # GreenEnergy
                'document_type': 'financial_statement',
                'title': 'Annual Financial Statements 2023',
                'fiscal_year': 2023,
                'description': 'Audited financial statements for 2023',
                'is_verified': True
            },
            {
                'enterprise': created_enterprises[2],  # LocalCafe
                'document_type': 'business_license',
                'title': 'Operating License',
                'fiscal_year': 2024,
                'description': 'Business operating license from local authority',
                'is_verified': False
            }
        ]

        created_documents = []
        for doc_data in documents_data:
            # Set verification details for verified documents
            if doc_data.get('is_verified'):
                doc_data['verified_by'] = admin_user
                doc_data['verified_at'] = timezone.now()
                doc_data['verification_notes'] = 'Document verified and approved'
            
            document = EnterpriseDocument.objects.create(**doc_data)
            created_documents.append(document)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_documents)} enterprise documents.'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n--- Data Population Summary ---'))
        self.stdout.write(self.style.SUCCESS(f'✓ Users: {len(enterprises_data) + 1} (including 1 admin)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Enterprises: {len(created_enterprises)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Categories: {len(created_categories)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Questionnaires: {len(created_questionnaires)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Questions: {len(created_questions)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Assessments: {len(created_assessments)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Plans: {len(created_plans)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Subscriptions: {len(created_subscriptions)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Payments: {len(created_payments)}'))
        self.stdout.write(self.style.SUCCESS('\nDatabase successfully populated with sample data!'))
        self.stdout.write(self.style.WARNING('\nAdmin login: username=admin, password=admin123'))
        self.stdout.write(self.style.WARNING('Enterprise logins: username={enterprise_name}, password=password123'))
