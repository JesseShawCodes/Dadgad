# Generated manually for championship matchups

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("brackets", "0006_sessionmatchuppick"),
    ]

    operations = [
        migrations.AddField(
            model_name="matchup",
            name="is_championship",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="matchup",
            name="feeder1",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="championship_feeder1_matchups",
                to="brackets.matchup",
            ),
        ),
        migrations.AddField(
            model_name="matchup",
            name="feeder2",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="championship_feeder2_matchups",
                to="brackets.matchup",
            ),
        ),
    ]
