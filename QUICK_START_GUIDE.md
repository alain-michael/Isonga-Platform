# Isonga Platform - Quick Start Guide

## Current Project Status

### ✅ What's Working
- User authentication (JWT-based)
- Enterprise registration and profile management
- Assessment system with questionnaires
- Basic payment models (Stripe integration started)
- Admin dashboard for managing enterprises
- React frontend with Tailwind CSS and React Query

### ❌ Critical Missing Features (Required for MVP)

1. **Mobile Money Payment Integration** (Phase 3 - CRITICAL)
   - MTN Mobile Money API
   - Airtel Money API
   - Payment webhooks and verification

2. **Document AI Integration** (Phase 4 - CRITICAL)
   - Google Document AI for extracting financial data
   - Auto-data extraction from uploaded documents

3. **Investor System** (Phase 4 - CRITICAL)
   - Investor user type and profiles
   - Investor preferences and criteria
   - Investor dashboard

4. **Matching Algorithm** (Phase 4 - CRITICAL)
   - Algorithm to match SMEs with investors
   - Match scoring system
   - Match management

5. **Communication System** (Phase 5 - IMPORTANT)
   - Messaging between investors and SMEs
   - Document requests and responses
   - Notification service (WhatsApp/Email)

6. **Multi-language Support** (Phase 1 - NICE TO HAVE)
   - Language selection on welcome page
   - Translation files for EN, RW, FR, SW

---

## Immediate Next Steps

### Step 1: Set Up External API Accounts

#### MTN Mobile Money
1. Go to https://momodeveloper.mtn.com/
2. Create a developer account
3. Subscribe to Collections API
4. Get API credentials:
   - Primary Key
   - Secondary Key
   - API User
   - API Key

#### Airtel Money
1. Contact Airtel Business for API access
2. Get API credentials

#### Google Cloud Document AI
1. Create a Google Cloud project
2. Enable Document AI API
3. Create a Document AI processor (choose "Form Parser" or "Financial Document Processor")
4. Download service account JSON credentials
5. Note the Processor ID

#### WhatsApp Business API
1. Option A: Use Twilio
   - Sign up at https://www.twilio.com/
   - Get WhatsApp sandbox or production access
   - Get Account SID and Auth Token

2. Option B: Direct Meta integration
   - Apply for WhatsApp Business API access

#### Email Service (Choose one)
1. SendGrid: https://sendgrid.com/
2. AWS SES: https://aws.amazon.com/ses/
3. Mailgun: https://www.mailgun.com/

### Step 2: Update Environment Variables

Add to `backend/.env`:
```bash
# MTN Mobile Money
MTN_API_KEY=your_mtn_primary_key
MTN_API_SECRET=your_mtn_secondary_key
MTN_API_USER=your_mtn_api_user
MTN_SUBSCRIPTION_KEY=your_subscription_key
MTN_CALLBACK_URL=https://yourdomain.com/api/payments/mtn/callback/
MTN_ENVIRONMENT=sandbox  # Change to 'production' when ready

# Airtel Money
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
AIRTEL_CALLBACK_URL=https://yourdomain.com/api/payments/airtel/callback/
AIRTEL_ENVIRONMENT=sandbox

# Google Document AI
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
DOCUMENT_AI_PROCESSOR_ID=your_processor_id
DOCUMENT_AI_LOCATION=us  # or 'eu'

# Twilio (for WhatsApp)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@isonga.com

# Celery (for async tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Step 3: Install Additional Dependencies

Update `backend/requirements.txt` add:
```
# Payment Integrations
requests-oauthlib==1.3.1

# Google Cloud
google-cloud-documentai==2.27.0
google-cloud-storage==2.16.0

# Notifications
twilio==9.0.4
sendgrid==6.11.0

# Async Tasks
celery==5.3.6
redis==5.0.3

# PDF Generation
reportlab==4.1.0
weasyprint==60.2

# Charts for PDF
matplotlib==3.8.3
```

### Step 4: Create Missing Django Apps

Run these commands from `backend/` directory:
```bash
python manage.py startapp investors
python manage.py startapp matching
python manage.py startapp communications
python manage.py startapp notifications
python manage.py startapp audit
```

### Step 5: Register Apps in Settings

Add to `backend/isonga/settings.py`:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'investors',
    'matching',
    'communications',
    'notifications',
    'audit',
]
```

---

## Development Workflow

### Backend Development

1. **Create models** in each new app
2. **Create migrations**: `python manage.py makemigrations`
3. **Run migrations**: `python manage.py migrate`
4. **Create serializers** for API endpoints
5. **Create views** and URL patterns
6. **Test with Postman** or similar tool

### Frontend Development

1. **Create service functions** in `src/services/`
2. **Create React Query hooks** in `src/hooks/`
3. **Build UI components** in `src/components/`
4. **Add routes** in `App.tsx`
5. **Test in browser**

---

## Testing Strategy

### Payment Integration Testing

1. Use sandbox/test environments for all payment gateways
2. Test scenarios:
   - Successful payment
   - Failed payment
   - Timeout/cancelled payment
   - Webhook handling
   - Payment verification

### Document AI Testing

1. Use sample financial documents
2. Test extraction accuracy
3. Verify data mapping to database fields
4. Test error handling for invalid documents

### Matching Algorithm Testing

1. Create test investors with various criteria
2. Create test SMEs with various profiles
3. Verify matches are logical
4. Test edge cases (no matches, multiple matches)

---

## Deployment Preparation

### Infrastructure Requirements

1. **Database**: PostgreSQL (recommended) or MySQL
2. **Cache**: Redis for Celery and caching
3. **Storage**: AWS S3 or similar for document storage
4. **Hosting**: AWS, Google Cloud, or Azure
5. **Domain**: Custom domain with SSL certificate

### Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Regular security audits
- [ ] Implement backup strategy

---

## Key Files to Implement

### Priority 1: Payment Integration

**Backend:**
- `backend/payments/services/momo_service.py` - MTN Mobile Money
- `backend/payments/services/airtel_service.py` - Airtel Money
- `backend/payments/views.py` - Payment endpoints and webhooks
- `backend/payments/signals.py` - Handle payment success events

**Frontend:**
- `frontend/src/components/payments/PaymentOptions.tsx`
- `frontend/src/components/payments/MobileMoneyPayment.tsx`
- `frontend/src/components/payments/PaymentSuccess.tsx`
- `frontend/src/services/paymentService.ts`

### Priority 2: Document AI

**Backend:**
- `backend/enterprises/services/document_ai.py` - Google Document AI integration
- `backend/enterprises/services/financial_extractor.py` - Parse extracted data
- `backend/enterprises/tasks.py` - Celery task for async processing

**Frontend:**
- `frontend/src/components/dataroom/DataRoom.tsx`
- `frontend/src/components/dataroom/DocumentUploader.tsx`
- `frontend/src/components/dataroom/ExtractionProgress.tsx`

### Priority 3: Investor & Matching

**Backend:**
- `backend/investors/models.py` - Investor and InvestorCriteria models
- `backend/investors/views.py` - Investor CRUD operations
- `backend/matching/models.py` - Match model
- `backend/matching/services/matcher.py` - Matching algorithm
- `backend/matching/views.py` - Match endpoints

**Frontend:**
- `frontend/src/components/investor/InvestorDashboard.tsx`
- `frontend/src/components/matching/MatchesList.tsx`
- `frontend/src/components/matching/InvestorProfile.tsx`

### Priority 4: Communications

**Backend:**
- `backend/communications/models.py` - Message and DocumentRequest models
- `backend/communications/views.py` - Communication endpoints
- `backend/notifications/services/whatsapp.py` - WhatsApp notifications
- `backend/notifications/services/email.py` - Email notifications

**Frontend:**
- `frontend/src/components/communications/MessageCenter.tsx`
- `frontend/src/components/communications/DocumentRequests.tsx`

---

## Code Examples

### MTN Mobile Money Payment Flow

```python
# backend/payments/services/momo_service.py
import requests
import uuid
from django.conf import settings

class MTNMoMoService:
    def __init__(self):
        self.base_url = "https://sandbox.momodeveloper.mtn.com"  # Change for production
        self.subscription_key = settings.MTN_SUBSCRIPTION_KEY
        
    def initiate_payment(self, phone_number, amount, currency="RWF"):
        """Initiate a payment request"""
        reference_id = str(uuid.uuid4())
        
        headers = {
            "Authorization": f"Bearer {self.get_access_token()}",
            "X-Reference-Id": reference_id,
            "X-Target-Environment": settings.MTN_ENVIRONMENT,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "amount": str(amount),
            "currency": currency,
            "externalId": reference_id,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": phone_number
            },
            "payerMessage": "Isonga Platform Subscription",
            "payeeNote": "Payment for platform access"
        }
        
        response = requests.post(
            f"{self.base_url}/collection/v1_0/requesttopay",
            json=payload,
            headers=headers
        )
        
        return {
            "reference_id": reference_id,
            "status": response.status_code == 202
        }
    
    def check_payment_status(self, reference_id):
        """Check the status of a payment"""
        # Implementation here
        pass
```

### Google Document AI Integration

```python
# backend/enterprises/services/document_ai.py
from google.cloud import documentai_v1 as documentai
from django.conf import settings

class DocumentAIService:
    def __init__(self):
        self.project_id = settings.GOOGLE_CLOUD_PROJECT
        self.location = settings.DOCUMENT_AI_LOCATION
        self.processor_id = settings.DOCUMENT_AI_PROCESSOR_ID
        
    def process_document(self, file_content, mime_type="application/pdf"):
        """Process a document and extract data"""
        client = documentai.DocumentProcessorServiceClient()
        
        name = client.processor_path(
            self.project_id, self.location, self.processor_id
        )
        
        raw_document = documentai.RawDocument(
            content=file_content,
            mime_type=mime_type
        )
        
        request = documentai.ProcessRequest(
            name=name,
            raw_document=raw_document
        )
        
        result = client.process_document(request=request)
        return result.document
    
    def extract_financial_data(self, document):
        """Extract financial metrics from processed document"""
        extracted_data = {
            "revenue": None,
            "profit": None,
            "assets": None,
            "liabilities": None
        }
        
        # Parse document entities and extract financial data
        for entity in document.entities:
            if entity.type_ == "total_revenue":
                extracted_data["revenue"] = self.parse_amount(entity.mention_text)
            elif entity.type_ == "net_profit":
                extracted_data["profit"] = self.parse_amount(entity.mention_text)
            # ... more parsing logic
        
        return extracted_data
```

### Matching Algorithm

```python
# backend/matching/services/matcher.py
from enterprises.models import Enterprise
from investors.models import Investor, InvestorCriteria
from matching.models import Match

class MatchingService:
    def find_matches_for_enterprise(self, enterprise):
        """Find potential investor matches for an SME"""
        matches = []
        
        # Get all active investors
        investors = Investor.objects.filter(is_active=True)
        
        for investor in investors:
            score = self.calculate_match_score(enterprise, investor)
            if score >= 50:  # Minimum threshold
                matches.append({
                    "investor": investor,
                    "score": score,
                    "reasons": self.get_match_reasons(enterprise, investor)
                })
        
        # Sort by score descending
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches
    
    def calculate_match_score(self, enterprise, investor):
        """Calculate match score between SME and investor"""
        score = 0
        criteria = investor.criteria
        
        # Sector match (30 points)
        if enterprise.sector in criteria.sectors:
            score += 30
        
        # Revenue range match (25 points)
        if criteria.min_revenue <= enterprise.annual_revenue <= criteria.max_revenue:
            score += 25
        
        # Location match (20 points)
        if enterprise.district in criteria.preferred_locations:
            score += 20
        
        # Enterprise size match (15 points)
        if enterprise.enterprise_size in criteria.preferred_sizes:
            score += 15
        
        # Assessment score match (10 points)
        latest_assessment = enterprise.assessments.filter(status='completed').first()
        if latest_assessment and latest_assessment.percentage_score >= criteria.min_assessment_score:
            score += 10
        
        return score
```

---

## Common Issues and Solutions

### Issue: Payment webhook not receiving callbacks
**Solution:** Ensure your server is publicly accessible. Use ngrok for local testing.

### Issue: Document AI returning empty entities
**Solution:** Check that you're using the correct processor type. Financial Document Processor works best for financial statements.

### Issue: Matching algorithm returns no results
**Solution:** Verify that:
1. Enterprises have completed assessments
2. Investors have defined criteria
3. Threshold score isn't too high

### Issue: Celery tasks not running
**Solution:** 
1. Ensure Redis is running
2. Start Celery worker: `celery -A isonga worker -l info`
3. Check Celery logs for errors

---

## Resources

- **MTN Mobile Money Docs**: https://momodeveloper.mtn.com/api-documentation/
- **Google Document AI**: https://cloud.google.com/document-ai/docs
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **Django Best Practices**: https://django-best-practices.readthedocs.io/
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Support

For questions or issues:
1. Check this guide first
2. Review the IMPLEMENTATION_PLAN.md for detailed tasks
3. Check Django/React documentation
4. Review API provider documentation

---

Last Updated: December 2025
