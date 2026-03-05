from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds the '_default' sentinel choice to BusinessProfileForm.sector so the
    fallback default form has its own stable sector slot that never conflicts
    with any real SME sector.
    """

    dependencies = [
        ('enterprises', '0005_businessprofileform_is_default'),
    ]

    operations = [
        migrations.AlterField(
            model_name='businessprofileform',
            name='sector',
            field=models.CharField(
                choices=[
                    ('agriculture', 'Agriculture'),
                    ('manufacturing', 'Manufacturing'),
                    ('services', 'Services'),
                    ('technology', 'Technology'),
                    ('retail', 'Retail'),
                    ('construction', 'Construction'),
                    ('healthcare', 'Healthcare'),
                    ('education', 'Education'),
                    ('finance', 'Finance'),
                    ('other', 'Other'),
                    ('_default', 'Default (All Sectors)'),
                ],
                help_text="One form template per sector. Use '_default' for the fallback form.",
                max_length=50,
                unique=True,
            ),
        ),
    ]
