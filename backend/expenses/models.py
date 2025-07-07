# backend/expenses/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='💰')
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']  # Fix pagination warning
    
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
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    date = models.DateField()  # Changed from DateTimeField to DateField
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    is_ai_categorized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - ₹{self.amount}"

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
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
        return f"{self.user.username} - {self.category.name} - ₹{self.amount}/{self.period}"
    
    @property
    def spent_amount(self):
        return self.category.expenses.filter(
            user=self.user,
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