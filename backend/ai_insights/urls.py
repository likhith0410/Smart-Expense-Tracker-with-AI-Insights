# backend/apps/ai_insights/urls.py
from django.urls import path
from .views import spending_insights, budget_recommendations, categorize_expense, scan_receipt

urlpatterns = [
    path('insights/', spending_insights, name='spending_insights'),
    path('recommendations/', budget_recommendations, name='budget_recommendations'),
    path('categorize/', categorize_expense, name='categorize_expense'),
    path('scan-receipt/', scan_receipt, name='scan_receipt'),
]