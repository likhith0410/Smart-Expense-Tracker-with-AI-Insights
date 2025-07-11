# backend/expenses/serializers.py - SIMPLIFIED FOR HARDCODED CATEGORIES
from rest_framework import serializers
from .models import Category, Expense, Budget

class CategorySerializer(serializers.ModelSerializer):
    """Keep for backwards compatibility but not used with hardcoded categories"""
    expense_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'expense_count', 'total_amount']
    
    def get_expense_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.expenses.filter(user=request.user).count()
        return 0
    
    def get_total_amount(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.expenses.filter(user=request.user).aggregate(
                total=serializers.models.Sum('amount')
            )['total']
            return total or 0
        return 0

class ExpenseSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField to get category display info
    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()
    category_color = serializers.SerializerMethodField()
    receipt_image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'description', 'amount', 'payment_method',
            'date', 'receipt_image', 'is_recurring', 'is_ai_categorized',
            'category', 'category_name', 'category_icon', 'category_color',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_ai_categorized', 'created_at', 'updated_at']
    
    def get_category_name(self, obj):
        return obj.category_name
    
    def get_category_icon(self, obj):
        return obj.category_icon
    
    def get_category_color(self, obj):
        return obj.category_color
    
    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def validate_category(self, value):
        """Validate that category is in allowed choices"""
        valid_categories = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category selected")
        return value
    
    def create(self, validated_data):
        # Remove receipt_image if it's empty or None
        if 'receipt_image' in validated_data and not validated_data['receipt_image']:
            validated_data.pop('receipt_image')
        
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Remove receipt_image if it's empty or None during update
        if 'receipt_image' in validated_data and not validated_data['receipt_image']:
            validated_data.pop('receipt_image')
        
        return super().update(instance, validated_data)

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    spent_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'amount', 'period',
            'start_date', 'end_date', 'is_active', 'spent_amount',
            'remaining_amount', 'progress_percentage', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
    
    def get_category_name(self, obj):
        return obj.category_name
    
    def validate_category(self, value):
        """Validate that category is in allowed choices"""
        valid_categories = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category selected")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ExpenseStatsSerializer(serializers.Serializer):
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_transactions = serializers.IntegerField()
    avg_transaction = serializers.DecimalField(max_digits=10, decimal_places=2)
    top_category = serializers.CharField()
    monthly_trend = serializers.ListField()
    category_breakdown = serializers.ListField()