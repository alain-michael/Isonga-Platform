"""
AI utilities for generating assessment insights using Google Gemini API
"""
import google.generativeai as genai
from django.conf import settings
import json

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_assessment_insights(assessment, enterprise):
    """
    Generate strengths, weaknesses, and recommendations using Gemini AI
    
    Args:
        assessment: Assessment instance with scores and responses
        enterprise: Enterprise instance with business details
        
    Returns:
        dict: {
            'strengths': [list of strength strings],
            'weaknesses': [list of weakness strings],
            'recommendations': [list of recommendation dicts with title, description, priority, suggested_actions]
        }
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured")
    
    # Prepare assessment data
    category_scores = []
    for cat_score in assessment.category_scores.all():
        category_scores.append({
            'category': cat_score.category.name,
            'score': float(cat_score.score),
            'max_score': float(cat_score.max_score),
            'percentage': float(cat_score.percentage)
        })
    
    # Prepare responses with questions
    responses_data = []
    for response in assessment.responses.all():
        question = response.question
        response_info = {
            'category': question.category.name,
            'question': question.text,
            'score': float(response.score),
            'max_score': question.max_score
        }
        
        # Add answer details
        if response.selected_options.exists():
            response_info['answer'] = [opt.text for opt in response.selected_options.all()]
        elif response.text_response:
            response_info['answer'] = response.text_response
        elif response.number_response is not None:
            response_info['answer'] = float(response.number_response)
        
        responses_data.append(response_info)
    
    # Build enterprise profile with all available fields
    enterprise_details = [
        f"Name: {enterprise.business_name}",
        f"Sector: {enterprise.sector}",
        f"Location: {enterprise.district}, Rwanda"
    ]
    
    # Add optional fields if available
    if hasattr(enterprise, 'enterprise_type') and enterprise.enterprise_type:
        enterprise_details.append(f"Type: {enterprise.enterprise_type}")
    if hasattr(enterprise, 'management_structure') and enterprise.management_structure:
        enterprise_details.append(f"Management: {enterprise.management_structure}")
    if hasattr(enterprise, 'province') and enterprise.province:
        enterprise_details.append(f"Province: {enterprise.province}")
    if hasattr(enterprise, 'number_of_employees') and enterprise.number_of_employees:
        enterprise_details.append(f"Employees: {enterprise.number_of_employees}")
    if hasattr(enterprise, 'years_in_operation') and enterprise.years_in_operation:
        enterprise_details.append(f"Years Operating: {enterprise.years_in_operation}")
    if hasattr(enterprise, 'annual_revenue') and enterprise.annual_revenue:
        enterprise_details.append(f"Annual Revenue: {enterprise.annual_revenue}")
    if hasattr(enterprise, 'description') and enterprise.description:
        enterprise_details.append(f"Description: {enterprise.description}")
    
    enterprise_profile = " | ".join(enterprise_details)
    
    # Build comprehensive prompt
    prompt = f"""Analyze this investment readiness assessment for a Rwandan SME and provide actionable insights.

**Enterprise:** {enterprise_profile}
**Overall Score:** {float(assessment.percentage_score):.1f}% ({float(assessment.total_score):.1f}/{float(assessment.max_possible_score):.1f})

**Category Scores:**
{json.dumps(category_scores, indent=2)}

**Sample Responses:**
{json.dumps(responses_data[:15], indent=2)}

Return JSON with:
- 3-5 strengths (areas ≥70%)
- 3-5 weaknesses (areas <70%)
- 5-7 recommendations (prioritized high/medium/low)

Format:
{{
  "strengths": ["strength with specific category reference", ...],
  "weaknesses": ["weakness with specific category reference", ...],
  "recommendations": [
    {{
      "title": "Action-oriented title",
      "description": "Why important for {enterprise.business_name} in {enterprise.sector}",
      "priority": "high|medium|low",
      "suggested_actions": "3-5 concrete, measurable steps",
      "category": "Related category name"
    }},
    ...
  ]
}}

Priority guide: high=critical gaps (<50%), medium=improvements (50-70%), low=optimization (>70%)"""
    
    try:
        # Use Gemini 1.5 Flash for fast, cost-effective generation
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,  # Increased from 2048 to allow complete responses
                response_mime_type="application/json",
            ),
            safety_settings={
                'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
            }
        )
                
        # Check if response was blocked
        if not response.candidates:
            if response.prompt_feedback:
                raise ValueError(f"No candidates returned. Prompt feedback: {response.prompt_feedback}")
            raise ValueError("No candidates returned by Gemini API")
        
        candidate = response.candidates[0]
        
        # Check finish reason (1 = STOP, 2 = MAX_TOKENS)
        # Note: finish_reason is an enum, compare by value
        finish_reason_name = candidate.finish_reason.name if hasattr(candidate.finish_reason, 'name') else str(candidate.finish_reason)
        if finish_reason_name not in ['STOP', '1']:
            raise ValueError(f"Generation stopped abnormally. Finish reason: {finish_reason_name} ({candidate.finish_reason})")
        
        if not candidate.content or not candidate.content.parts:
            raise ValueError("Response has no content parts")
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Try to find JSON object in the response
        # Sometimes the AI adds extra text before or after the JSON
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            response_text = response_text[start_idx:end_idx + 1]
        
        # Parse JSON
        try:
            insights = json.loads(response_text)
        except json.JSONDecodeError as e:
            # Log the problematic response for debugging
            print(f"JSON parsing error: {e}")
            print(f"Response text (first 1000 chars): {response_text[:1000]}")
            print(f"Response text (last 500 chars): {response_text[-500:]}")
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        
        # Validate structure
        if not all(key in insights for key in ['strengths', 'weaknesses', 'recommendations']):
            raise ValueError("Invalid response structure from AI")
        
        return insights
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        print(f"Gemini API error: {e}")
        raise ValueError(f"Failed to generate insights: {str(e)}")
