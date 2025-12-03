# Isonga Platform - Complete Implementation Plan

## Project Overview
The Isonga platform connects SMEs with investors through a 5-phase workflow: Onboarding & Authorization, Assessment & Scoring, Payment & Data Room Unlock, Vetting & Investor Matching, and Engagement or Termination.

---

## Current Status Assessment

### ✅ Already Implemented (Backend)
- **Users Table**: `accounts.User` model with user types (superadmin, admin, enterprise)
- **SMEs Table**: `enterprises.Enterprise` model with business details, verification status
- **Assessments Table**: `assessments.Assessment` model with questionnaire, scoring
- **Documents Table**: `enterprises.EnterpriseDocument` model for document uploads
- **Billing Table**: `payments.Subscription` and `payments.Payment` models
- Basic authentication with JWT tokens
- Admin API for enterprise management

### ✅ Already Implemented (Frontend)
- Authentication (Login/Register)
- Dashboard with sidebar layout
- Business registration flow
- Profile management
- Assessment components
- Admin dashboard and enterprise management
- React Query for data fetching
- Tailwind CSS styling

### ❌ Missing Features to Complete

---

## Phase 1: Onboarding & Authorization - ENHANCEMENTS NEEDED

### Backend Tasks

#### 1.1 Multi-language Support
- [ ] Add language preference field to User model
- [ ] Create translation service for UI text
- [ ] Implement language switching API endpoint
- [ ] Update serializers to support language field

**Files to modify:**
- `backend/accounts/models.py` - Add language field
- `backend/accounts/serializers.py` - Include language in serializers
- `backend/accounts/views.py` - Add language preference endpoint

#### 1.2 Enhanced KYC for SME Profile
- [ ] Add conditional KYC fields based on enterprise type
- [ ] Implement field validation rules
- [ ] Add KYC document upload support

**Files to modify:**
- `backend/enterprises/models.py` - Add KYC-specific fields
- `backend/enterprises/serializers.py` - Conditional field validation
- `backend/enterprises/views.py` - KYC completion tracking

#### 1.3 Role-Based Routing Enhancement
- [ ] Add investor user type
- [ ] Create investor profile model
- [ ] Implement role-based dashboard routing

**Files to create:**
- `backend/investors/` - New Django app
- `backend/investors/models.py` - Investor, InvestorPreference models
- `backend/investors/serializers.py`
- `backend/investors/views.py`

### Frontend Tasks

#### 1.4 Welcome/Language Selection Page
- [ ] Create landing page with language selector
- [ ] Implement i18n with react-i18next
- [ ] Add language persistence in localStorage

**Files to create:**
- `frontend/src/components/welcome/WelcomePage.tsx`
- `frontend/src/i18n/` - Translation files (en, rw, fr, sw)
- `frontend/src/hooks/useLanguage.ts`

#### 1.5 Enhanced Registration Flow
- [ ] Add phone verification with SMS OTP
- [ ] Implement multi-step conditional KYC forms
- [ ] Add progress indicator for registration

**Files to modify:**
- `frontend/src/components/auth/Register.tsx`
- `frontend/src/components/registration/BusinessRegistrationFlow.tsx`

---

## Phase 2: Assessment & Scoring - ENHANCEMENTS NEEDED

### Backend Tasks

#### 2.1 Dynamic Questionnaire System
- [ ] Implement conditional question logic
- [ ] Add question branching based on responses
- [ ] Create questionnaire versioning system

**Files to modify:**
- `backend/assessments/models.py` - Add conditional logic fields
- `backend/assessments/serializers.py` - Dynamic question rendering
- `backend/assessments/views.py` - Conditional question API

#### 2.2 PDF Generation Service
- [ ] Implement Readiness PDF generation with scores
- [ ] Add charts and visualizations to PDF
- [ ] Create recommendation engine based on scores

**Files to create:**
- `backend/assessments/services/pdf_generator.py`
- `backend/assessments/services/recommendation_engine.py`

**Dependencies to add:**
- `reportlab` or `weasyprint` for PDF generation
- `matplotlib` or `plotly` for charts

#### 2.3 Business Model & Financial Health Scoring
- [ ] Create scoring algorithms for different categories
- [ ] Implement weighted scoring system
- [ ] Add financial health indicators

**Files to create:**
- `backend/assessments/services/scoring_engine.py`

### Frontend Tasks

#### 2.4 Interactive Assessment UI
- [ ] Create dynamic question renderer
- [ ] Add real-time validation
- [ ] Implement auto-save functionality
- [ ] Add progress tracking

**Files to modify:**
- `frontend/src/components/assessments/AssessmentForm.tsx`

#### 2.5 Results & PDF Download
- [ ] Create results dashboard with charts
- [ ] Add PDF download functionality
- [ ] Show recommendations and next steps

**Files to create:**
- `frontend/src/components/assessments/AssessmentResults.tsx`
- `frontend/src/components/assessments/ScoreVisualizations.tsx`

---

## Phase 3: Payment & Data Room Unlock - CRITICAL MISSING

### Backend Tasks

#### 3.1 MTN/Airtel Mobile Money Integration
- [ ] Research and integrate MTN Mobile Money API
- [ ] Integrate Airtel Money API
- [ ] Create payment initiation endpoint
- [ ] Implement payment callback/webhook handler
- [ ] Add payment verification logic

**Files to create:**
- `backend/payments/services/momo_service.py`
- `backend/payments/services/airtel_money_service.py`
- `backend/payments/views.py` - Add mobile money endpoints

**Environment variables needed:**
- `MTN_API_KEY`
- `MTN_API_SECRET`
- `MTN_CALLBACK_URL`
- `AIRTEL_API_KEY`
- `AIRTEL_API_SECRET`
- `AIRTEL_CALLBACK_URL`

#### 3.2 Payment Gateway Integration
- [ ] Update Stripe integration (already partially implemented)
- [ ] Add payment status tracking
- [ ] Implement payment retry logic
- [ ] Create billing history endpoint

**Files to modify:**
- `backend/payments/models.py` - Add mobile money fields
- `backend/payments/views.py` - Payment processing endpoints

#### 3.3 Data Room Unlock System
- [ ] Create feature access control system
- [ ] Add subscription status checking middleware
- [ ] Implement grace period for expired subscriptions

**Files to create:**
- `backend/payments/middleware.py` - Subscription check middleware
- `backend/payments/decorators.py` - @requires_subscription decorator

### Frontend Tasks

#### 3.4 Payment Gateway UI
- [ ] Create opt-in/upgrade page
- [ ] Implement mobile money payment flow
- [ ] Add payment method selection
- [ ] Create payment confirmation page

**Files to create:**
- `frontend/src/components/payments/PaymentOptions.tsx`
- `frontend/src/components/payments/MobileMoneyPayment.tsx`
- `frontend/src/components/payments/PaymentConfirmation.tsx`
- `frontend/src/services/paymentService.ts`

#### 3.5 Subscription Management UI
- [ ] Create subscription status display
- [ ] Add billing history page
- [ ] Implement upgrade/downgrade options

**Files to create:**
- `frontend/src/components/subscription/SubscriptionStatus.tsx`
- `frontend/src/components/subscription/BillingHistory.tsx`

---

## Phase 4: Vetting & Investor Matching - CRITICAL MISSING

### Backend Tasks

#### 4.1 Google Document AI Integration
- [ ] Set up Google Cloud project
- [ ] Integrate Document AI API
- [ ] Create document processing service
- [ ] Implement auto-data extraction for financial documents
- [ ] Store extracted data in database

**Files to create:**
- `backend/enterprises/services/document_ai_service.py`
- `backend/enterprises/services/financial_extractor.py`

**Dependencies to add:**
- `google-cloud-documentai`

**Environment variables needed:**
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `DOCUMENT_AI_PROCESSOR_ID`

#### 4.2 Document Vetting System
- [ ] Create document verification workflow
- [ ] Add admin review interface
- [ ] Implement automated checks (file type, size, completeness)
- [ ] Add vetting status tracking

**Files to modify:**
- `backend/enterprises/models.py` - Add vetting status fields
- `backend/enterprises/views.py` - Vetting endpoints

**Files to create:**
- `backend/enterprises/services/vetting_service.py`

#### 4.3 Investor Matching Algorithm
- [ ] Create investor preference model
- [ ] Implement matching algorithm (sector, size, revenue, location)
- [ ] Add match scoring system
- [ ] Create matches table and API

**Files to create:**
- `backend/investors/models.py` - Investor, InvestorCriteria, Match models
- `backend/matching/` - New Django app
- `backend/matching/services/matching_algorithm.py`
- `backend/matching/models.py` - Match, MatchScore models
- `backend/matching/views.py` - Match endpoints

#### 4.4 Notification Service
- [ ] Integrate WhatsApp Business API
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Create notification templates
- [ ] Implement notification triggers

**Files to create:**
- `backend/notifications/` - New Django app
- `backend/notifications/services/whatsapp_service.py`
- `backend/notifications/services/email_service.py`
- `backend/notifications/models.py` - NotificationLog model

**Dependencies to add:**
- `twilio` for WhatsApp
- `sendgrid` or `boto3` for email

### Frontend Tasks

#### 4.5 Data Room Interface
- [ ] Create document upload interface
- [ ] Add document type categorization
- [ ] Implement drag-and-drop upload
- [ ] Show extraction status
- [ ] Display extracted financial data

**Files to create:**
- `frontend/src/components/dataroom/DataRoom.tsx`
- `frontend/src/components/dataroom/DocumentUploader.tsx`
- `frontend/src/components/dataroom/ExtractedDataView.tsx`

#### 4.6 Investor Matching Dashboard
- [ ] Display matched investors
- [ ] Show match scores and reasons
- [ ] Add investor detail view
- [ ] Implement connection request functionality

**Files to create:**
- `frontend/src/components/matching/MatchesDashboard.tsx`
- `frontend/src/components/matching/InvestorCard.tsx`
- `frontend/src/components/matching/InvestorProfile.tsx`

#### 4.7 Admin Vetting Interface
- [ ] Create document review interface
- [ ] Add approval/rejection workflow
- [ ] Implement request for additional documents
- [ ] Show extracted data for verification

**Files to create:**
- `frontend/src/components/admin/VettingQueue.tsx`
- `frontend/src/components/admin/DocumentReviewer.tsx`

---

## Phase 5: Engagement or Termination - ENHANCEMENTS NEEDED

### Backend Tasks

#### 5.1 Investor-SME Communication System
- [ ] Create messaging/communication model
- [ ] Implement document request system
- [ ] Add response tracking
- [ ] Create communication history

**Files to create:**
- `backend/communications/` - New Django app
- `backend/communications/models.py` - Message, DocumentRequest models
- `backend/communications/views.py`

#### 5.2 Notification Triggers
- [ ] Send notifications on new matches
- [ ] Alert on investor requests
- [ ] Notify on document uploads
- [ ] Send reminders

**Files to modify:**
- `backend/notifications/services/notification_triggers.py`

#### 5.3 Account Deletion System
- [ ] Implement soft delete functionality
- [ ] Create admin approval workflow
- [ ] Add audit logging
- [ ] Implement data anonymization

**Files to create:**
- `backend/audit/` - New Django app
- `backend/audit/models.py` - AuditLog model
- `backend/accounts/services/deletion_service.py`

### Frontend Tasks

#### 5.4 Communication Interface
- [ ] Create messaging dashboard
- [ ] Add investor request view
- [ ] Implement document response upload
- [ ] Show communication history

**Files to create:**
- `frontend/src/components/communications/MessageCenter.tsx`
- `frontend/src/components/communications/RequestViewer.tsx`
- `frontend/src/components/communications/ResponseForm.tsx`

#### 5.5 Account Management
- [ ] Add account deletion request form
- [ ] Create data export functionality
- [ ] Show account status

**Files to create:**
- `frontend/src/components/settings/AccountSettings.tsx`
- `frontend/src/components/settings/DataExport.tsx`
- `frontend/src/components/settings/DeleteAccount.tsx`

---

## Database Schema - New Tables Required

### Investors App
```python
class Investor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization_name = models.CharField(max_length=255)
    investor_type = models.CharField(max_length=50)  # VC, Angel, Institution
    portfolio_size = models.DecimalField(max_digits=15, decimal_places=2)
    # ... more fields

class InvestorCriteria(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE)
    sectors = models.JSONField()  # List of sectors
    min_revenue = models.DecimalField(max_digits=15, decimal_places=2)
    max_revenue = models.DecimalField(max_digits=15, decimal_places=2)
    preferred_locations = models.JSONField()
    # ... more fields
```

### Matching App
```python
class Match(models.Model):
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE)
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE)
    match_score = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20)  # pending, accepted, rejected
    created_at = models.DateTimeField(auto_now_add=True)
```

### Communications App
```python
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class DocumentRequest(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE)
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE)
    requested_documents = models.JSONField()
    status = models.CharField(max_length=20)  # pending, fulfilled, cancelled
```

### Notifications App
```python
class NotificationLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50)
    channel = models.CharField(max_length=20)  # email, whatsapp, sms
    content = models.TextField()
    status = models.CharField(max_length=20)  # sent, failed, pending
    sent_at = models.DateTimeField(null=True, blank=True)
```

### Audit App
```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    changes = models.JSONField()
    ip_address = models.GenericIPAddressField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## Implementation Priority Order

### Sprint 1: Complete Phase 3 (Payment Integration) - HIGH PRIORITY
1. MTN/Airtel Mobile Money API integration
2. Payment gateway UI
3. Subscription unlock mechanism
4. Payment webhooks and verification

### Sprint 2: Complete Phase 4 Part 1 (Document Processing) - HIGH PRIORITY
1. Google Document AI integration
2. Data Room interface
3. Document upload and extraction
4. Extracted data display

### Sprint 3: Complete Phase 4 Part 2 (Matching System) - HIGH PRIORITY
1. Create Investor models and app
2. Implement matching algorithm
3. Create Matches interface
4. Admin vetting system

### Sprint 4: Complete Phase 5 (Communication & Engagement) - MEDIUM PRIORITY
1. Communication system
2. Notification service (WhatsApp/Email)
3. Investor-SME messaging
4. Document request/response

### Sprint 5: Phase 1 & 2 Enhancements - LOW PRIORITY
1. Multi-language support
2. PDF generation for assessments
3. Enhanced KYC flows
4. Improved assessment UI

### Sprint 6: Account Management & Audit - LOW PRIORITY
1. Account deletion workflow
2. Audit logging system
3. Data export functionality
4. Admin approval system

---

## External API Integration Summary

### 1. MTN Mobile Money API
- **Purpose**: Process payments from SMEs
- **Endpoints needed**: 
  - Payment initiation
  - Payment status check
  - Callback/webhook handler
- **Documentation**: https://momodeveloper.mtn.com/

### 2. Airtel Money API
- **Purpose**: Alternative payment method
- **Endpoints needed**: 
  - Payment initiation
  - Payment verification
  - Webhook handler
- **Documentation**: Contact Airtel for API access

### 3. Google Document AI
- **Purpose**: Extract financial data from uploaded documents
- **Features needed**:
  - Financial document processor
  - Form parser for structured data
  - OCR for unstructured documents
- **Documentation**: https://cloud.google.com/document-ai/docs

### 4. WhatsApp Business API
- **Purpose**: Send notifications to users
- **Provider**: Twilio or Meta directly
- **Documentation**: https://developers.facebook.com/docs/whatsapp/

### 5. Email Service
- **Options**: SendGrid, AWS SES, or Mailgun
- **Purpose**: Send transactional emails and notifications

---

## Environment Variables Required

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
SECRET_KEY=...
JWT_SECRET_KEY=...

# Payment Gateways
MTN_API_KEY=...
MTN_API_SECRET=...
MTN_SUBSCRIPTION_KEY=...
MTN_CALLBACK_URL=...
AIRTEL_API_KEY=...
AIRTEL_API_SECRET=...
AIRTEL_CALLBACK_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=...
DOCUMENT_AI_PROCESSOR_ID=...

# Notifications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
SENDGRID_API_KEY=...
FROM_EMAIL=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
AWS_S3_REGION_NAME=...
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=...
```

---

## Testing Requirements

### Backend Tests
- [ ] Authentication and authorization tests
- [ ] Payment integration tests (with mock APIs)
- [ ] Document processing tests
- [ ] Matching algorithm tests
- [ ] API endpoint tests

### Frontend Tests
- [ ] Component unit tests
- [ ] Integration tests for user flows
- [ ] Payment flow E2E tests
- [ ] Form validation tests

---

## Documentation Required

- [ ] API documentation (Swagger/OpenAPI)
- [ ] User manual for SMEs
- [ ] User manual for Investors
- [ ] Admin guide
- [ ] Deployment guide
- [ ] API integration guides for payment gateways
- [ ] System architecture diagram

---

## Deployment Checklist

### Backend
- [ ] Set up production database (PostgreSQL)
- [ ] Configure cloud storage (AWS S3 or similar)
- [ ] Set up Redis for caching and Celery
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Configure logging and monitoring
- [ ] Set up backup system

### Frontend
- [ ] Build optimized production bundle
- [ ] Configure CDN for static assets
- [ ] Set up domain and SSL certificates
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics

---

## Success Metrics

1. **User Onboarding**: Track registration completion rate
2. **Assessment Completion**: Track assessment start-to-completion rate
3. **Payment Conversion**: Track opt-in and payment success rate
4. **Document Upload**: Track document upload and processing success rate
5. **Matching Success**: Track match acceptance rate
6. **Engagement**: Track investor-SME communication rate

---

## Next Steps

1. **Review this plan** with the team and stakeholders
2. **Prioritize features** based on business impact
3. **Set up external API accounts** (MTN, Airtel, Google Cloud)
4. **Create detailed tickets** for each task in Sprint 1
5. **Begin implementation** starting with Phase 3 (Payment Integration)

---

## Notes
- The current codebase has a solid foundation with Django backend and React frontend
- Most of the database models are already in place
- Main gaps are in external integrations (payment, document AI, notifications)
- The matching algorithm and investor functionality are completely missing
- Communication and engagement features need to be built from scratch
