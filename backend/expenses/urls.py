from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ExpenseViewSet, BudgetViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'budgets', BudgetViewSet, basename='budgets')

urlpatterns = [
    path('', include(router.urls)),
]