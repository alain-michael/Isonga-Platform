import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'isonga.settings')
django.setup()

from django.contrib.auth import get_user_model
from investors.models import Investor, InvestorCriteria
from enterprises.models import Enterprise
from campaigns.models import Campaign

User = get_user_model()

def create_dummy_data():
    print("Creating dummy data...")

    # 1. Create Investor User
    investor_email = "investor@example.com"
    if not User.objects.filter(email=investor_email).exists():
        user = User.objects.create_user(
            username="investor_demo",
            email=investor_email,
            password="password123",
            first_name="John",
            last_name="Doe",
            user_type="investor"
        )
        print(f"Created investor user: {investor_email}")
        
        # Create Investor Profile
        investor = Investor.objects.create(
            user=user,
            investor_type="individual",
            organization_name="Doe Capital",
            description="Angel investor looking for high-growth tech startups in Rwanda.",
            contact_email=investor_email,
            min_investment=Decimal("5000.00"),
            max_investment=Decimal("100000.00")
        )
        print("Created investor profile")

        # Create Investor Criteria
        InvestorCriteria.objects.create(
            investor=investor,
            sectors=["technology", "agriculture", "finance"],
            min_funding_amount=Decimal("10000.00"),
            max_funding_amount=Decimal("500000.00"),
            preferred_sizes=["micro", "small"],
            min_readiness_score=Decimal("50.00")
        )
        print("Created investor criteria")
    else:
        print(f"Investor user {investor_email} already exists")

    # 2. Create Dummy Enterprises and Campaigns
    sectors = ['technology', 'agriculture', 'finance', 'healthcare', 'education']
    
    for i in range(5):
        ent_email = f"enterprise{i}@example.com"
        if not User.objects.filter(email=ent_email).exists():
            user = User.objects.create_user(
                username=f"enterprise_demo_{i}",
                email=ent_email,
                password="password123",
                first_name=f"Ent{i}",
                last_name="Owner",
                user_type="enterprise"
            )
            
            sector = sectors[i % len(sectors)]
            enterprise = Enterprise.objects.create(
                user=user,
                business_name=f"Demo Enterprise {i}",
                tin_number=f"12345678{i}",
                enterprise_type="limited_company",
                enterprise_size="small",
                sector=sector,
                address="Kigali, Rwanda",
                city="Kigali",
                district="Gasabo",
                phone="+250788888888",
                email=ent_email,
                year_established=2020,
                number_of_employees=10,
                verification_status="approved"
            )
            
            # Create Campaign
            Campaign.objects.create(
                enterprise=enterprise,
                title=f"Growth Capital for {sector.title()} Startup",
                description=f"We are looking for investment to expand our {sector} operations.",
                campaign_type="equity",
                target_amount=Decimal(f"{20000 + (i * 10000)}.00"),
                min_investment=Decimal("1000.00"),
                status="active"
            )
            print(f"Created enterprise and campaign for {ent_email}")

    print("Dummy data creation complete.")

if __name__ == "__main__":
    create_dummy_data()
