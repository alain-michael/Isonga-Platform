from django.db.models import Avg, Q


def get_enterprise_readiness_score(enterprise):
    """
    Return the average percentage_score from completed/reviewed assessments
    whose questionnaire belongs to the 'General' AssessmentCategory, or
    whose questionnaire has no category (serializer shows those as 'General').
    Returns 0.0 if no qualifying assessments exist.
    """
    from .models import Assessment

    qs = Assessment.objects.filter(
        enterprise=enterprise,
        status__in=['completed', 'reviewed'],
    ).filter(
        Q(questionnaire__category__name='General') |
        Q(questionnaire__category__isnull=True)
    )

    result = qs.aggregate(avg=Avg('percentage_score'))['avg']
    return float(result or 0)
