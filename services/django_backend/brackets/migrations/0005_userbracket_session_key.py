# Generated manually for session-backed user brackets

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("brackets", "0004_userbracket_usermatchuppick_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="userbracket",
            name="unique_user_bracket_per_template",
        ),
        migrations.AddField(
            model_name="userbracket",
            name="session_key",
            field=models.CharField(db_index=True, default="", max_length=40),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="userbracket",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="user_brackets",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddConstraint(
            model_name="userbracket",
            constraint=models.UniqueConstraint(
                fields=("session_key", "bracket"),
                name="unique_session_bracket_per_template",
            ),
        ),
    ]
