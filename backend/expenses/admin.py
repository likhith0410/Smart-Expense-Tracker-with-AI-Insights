# backend/expenses/admin.py
from django.contrib import admin
from .models import Category, Expense, Budget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).order_by('name')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'amount', 'payment_method', 'date', 'created_at']
    list_filter = ['category', 'payment_method', 'date', 'is_recurring', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'category')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'amount', 'period', 'start_date', 'end_date', 'is_active']
    list_filter = ['period', 'is_active', 'created_at']
    search_fields = ['user__username', 'category__name']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'category')