# Generated manually to replace UserBracket + UserMatchupPick

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("brackets", "0005_userbracket_session_key"),
    ]

    operations = [
        migrations.CreateModel(
            name="SessionMatchupPick",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("session_key", models.CharField(db_index=True, max_length=40)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "matchup",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="session_picks",
                        to="brackets.matchup",
                    ),
                ),
                (
                    "winner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="session_matchup_wins",
                        to="brackets.bracketitem",
                    ),
                ),
            ],
        ),
        migrations.DeleteModel(
            name="UserMatchupPick",
        ),
        migrations.DeleteModel(
            name="UserBracket",
        ),
        migrations.AddConstraint(
            model_name="sessionmatchuppick",
            constraint=models.UniqueConstraint(
                fields=("session_key", "matchup"),
                name="unique_session_matchup_pick",
            ),
        ),
    ]
