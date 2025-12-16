from django.apps import AppConfig


class AppleSearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apple_search'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .auth import get_auth_token

        def run_get_auth_token_on_migration(sender, **kwargs):
            get_auth_token()

        post_migrate.connect(run_get_auth_token_on_migration, sender=self)
