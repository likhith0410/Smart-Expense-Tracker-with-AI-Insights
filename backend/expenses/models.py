# backend/expenses/models.py - SIMPLIFIED WITH HARDCODED CATEGORIES
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    """Keep this for backwards compatibility, but categories are now hardcoded in frontend"""
    CATEGORY_CHOICES = [
        ('food_dining', 'Food & Dining'),
        ('transportation', 'Transportation'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('healthcare', 'Healthcare'),
        ('utilities', 'Utilities'),
        ('education', 'Education'),
        ('groceries', 'Groceries'),
        ('fitness', 'Fitness'),
        ('travel', 'Travel'),
        ('bills_subscriptions', 'Bills & Subscriptions'),
        ('clothing', 'Clothing'),
        ('electronics', 'Electronics'),
        ('home_garden', 'Home & Garden'),
        ('gifts_donations', 'Gifts & Donations'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='💰')
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Expense(models.Model):
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('bank_transfer', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    # Updated category choices - now uses string values instead of foreign key
    CATEGORY_CHOICES = [
        ('food_dining', 'Food & Dining'),
        ('transportation', 'Transportation'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('healthcare', 'Healthcare'),
        ('utilities', 'Utilities'),
        ('education', 'Education'),
        ('groceries', 'Groceries'),
        ('fitness', 'Fitness'),
        ('travel', 'Travel'),
        ('bills_subscriptions', 'Bills & Subscriptions'),
        ('clothing', 'Clothing'),
        ('electronics', 'Electronics'),
        ('home_garden', 'Home & Garden'),
        ('gifts_donations', 'Gifts & Donations'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    # Changed from ForeignKey to CharField for categories
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    date = models.DateField()
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    is_ai_categorized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - ₹{self.amount}"
    
    # Helper methods to get category display info
    def get_category_display_info(self):
        category_info = {
            'food_dining': {'name': 'Food & Dining', 'icon': '🍽️', 'color': '#FF6B6B'},
            'transportation': {'name': 'Transportation', 'icon': '🚗', 'color': '#4ECDC4'},
            'shopping': {'name': 'Shopping', 'icon': '🛍️', 'color': '#45B7D1'},
            'entertainment': {'name': 'Entertainment', 'icon': '🎬', 'color': '#96CEB4'},
            'healthcare': {'name': 'Healthcare', 'icon': '🏥', 'color': '#FFEAA7'},
            'utilities': {'name': 'Utilities', 'icon': '⚡', 'color': '#DDA0DD'},
            'education': {'name': 'Education', 'icon': '📚', 'color': '#98D8C8'},
            'groceries': {'name': 'Groceries', 'icon': '🛒', 'color': '#F7DC6F'},
            'fitness': {'name': 'Fitness', 'icon': '💪', 'color': '#BB8FCE'},
            'travel': {'name': 'Travel', 'icon': '✈️', 'color': '#85C1E9'},
            'bills_subscriptions': {'name': 'Bills & Subscriptions', 'icon': '📄', 'color': '#F8C471'},
            'clothing': {'name': 'Clothing', 'icon': '👕', 'color': '#82E0AA'},
            'electronics': {'name': 'Electronics', 'icon': '📱', 'color': '#AED6F1'},
            'home_garden': {'name': 'Home & Garden', 'icon': '🏠', 'color': '#A9DFBF'},
            'gifts_donations': {'name': 'Gifts & Donations', 'icon': '🎁', 'color': '#F1948A'},
            'other': {'name': 'Other', 'icon': '💰', 'color': '#D5DBDB'},
        }
        return category_info.get(self.category, category_info['other'])
    
    @property
    def category_name(self):
        return self.get_category_display_info()['name']
    
    @property
    def category_icon(self):
        return self.get_category_display_info()['icon']
    
    @property
    def category_color(self):
        return self.get_category_display_info()['color']

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    # Changed from ForeignKey to CharField for categories
    category = models.CharField(max_length=50, choices=Expense.CATEGORY_CHOICES, default='other')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=20, choices=[
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly')
    ], default='monthly')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'category', 'period']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_category_display()} - ₹{self.amount}/{self.period}"
    
    @property
    def spent_amount(self):
        return Expense.objects.filter(
            user=self.user,
            category=self.category,
            date__range=[self.start_date, self.end_date]
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
    
    @property
    def remaining_amount(self):
        return self.amount - self.spent_amount
    
    @property
    def progress_percentage(self):
        if self.amount == 0:
            return 0
        return min((self.spent_amount / self.amount) * 100, 100)
    
    def get_category_display_info(self):
        category_info = {
            'food_dining': {'name': 'Food & Dining', 'icon': '🍽️', 'color': '#FF6B6B'},
            'transportation': {'name': 'Transportation', 'icon': '🚗', 'color': '#4ECDC4'},
            'shopping': {'name': 'Shopping', 'icon': '🛍️', 'color': '#45B7D1'},
            'entertainment': {'name': 'Entertainment', 'icon': '🎬', 'color': '#96CEB4'},
            'healthcare': {'name': 'Healthcare', 'icon': '🏥', 'color': '#FFEAA7'},
            'utilities': {'name': 'Utilities', 'icon': '⚡', 'color': '#DDA0DD'},
            'education': {'name': 'Education', 'icon': '📚', 'color': '#98D8C8'},
            'groceries': {'name': 'Groceries', 'icon': '🛒', 'color': '#F7DC6F'},
            'fitness': {'name': 'Fitness', 'icon': '💪', 'color': '#BB8FCE'},
            'travel': {'name': 'Travel', 'icon': '✈️', 'color': '#85C1E9'},
            'bills_subscriptions': {'name': 'Bills & Subscriptions', 'icon': '📄', 'color': '#F8C471'},
            'clothing': {'name': 'Clothing', 'icon': '👕', 'color': '#82E0AA'},
            'electronics': {'name': 'Electronics', 'icon': '📱', 'color': '#AED6F1'},
            'home_garden': {'name': 'Home & Garden', 'icon': '🏠', 'color': '#A9DFBF'},
            'gifts_donations': {'name': 'Gifts & Donations', 'icon': '🎁', 'color': '#F1948A'},
            'other': {'name': 'Other', 'icon': '💰', 'color': '#D5DBDB'},
        }
        return category_info.get(self.category, category_info['other'])
    
    @property
    def category_name(self):
        return self.get_category_display_info()['name']