from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('enterprises', '0004_businessprofileform_businessprofilesection_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessprofileform',
            name='is_default',
            field=models.BooleanField(
                default=False,
                help_text='If True, this form is shown for any sector that has no dedicated form',
            ),
        ),
    ]
