# backend/apps/authentication/apps.py
from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    label = 'authentication'

# backend/apps/expenses/apps.py
from django.apps import AppConfig

class ExpensesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'expenses'
    label = 'expenses'

# backend/apps/ai_insights/apps.py
from django.apps import AppConfig

class AiInsightsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_insights'
    label = 'ai_insights'