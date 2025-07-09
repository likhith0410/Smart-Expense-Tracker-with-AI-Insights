# backend/expenses/views.py - SIMPLIFIED FOR HARDCODED CATEGORIES
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
import logging

from .models import Category, Expense, Budget
from .serializers import (
    CategorySerializer, ExpenseSerializer, BudgetSerializer, ExpenseStatsSerializer
)

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    """Keep for backwards compatibility but categories are now hardcoded in frontend"""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.all()
    
    @action(detail=False, methods=['get'])
    def hardcoded_list(self, request):
        """Return hardcoded categories that match frontend"""
        categories = [
            {'id': 1, 'name': 'Food & Dining', 'icon': '🍽️', 'color': '#FF6B6B', 'value': 'food_dining'},
            {'id': 2, 'name': 'Transportation', 'icon': '🚗', 'color': '#4ECDC4', 'value': 'transportation'},
            {'id': 3, 'name': 'Shopping', 'icon': '🛍️', 'color': '#45B7D1', 'value': 'shopping'},
            {'id': 4, 'name': 'Entertainment', 'icon': '🎬', 'color': '#96CEB4', 'value': 'entertainment'},
            {'id': 5, 'name': 'Healthcare', 'icon': '🏥', 'color': '#FFEAA7', 'value': 'healthcare'},
            {'id': 6, 'name': 'Utilities', 'icon': '⚡', 'color': '#DDA0DD', 'value': 'utilities'},
            {'id': 7, 'name': 'Education', 'icon': '📚', 'color': '#98D8C8', 'value': 'education'},
            {'id': 8, 'name': 'Groceries', 'icon': '🛒', 'color': '#F7DC6F', 'value': 'groceries'},
            {'id': 9, 'name': 'Fitness', 'icon': '💪', 'color': '#BB8FCE', 'value': 'fitness'},
            {'id': 10, 'name': 'Travel', 'icon': '✈️', 'color': '#85C1E9', 'value': 'travel'},
            {'id': 11, 'name': 'Bills & Subscriptions', 'icon': '📄', 'color': '#F8C471', 'value': 'bills_subscriptions'},
            {'id': 12, 'name': 'Clothing', 'icon': '👕', 'color': '#82E0AA', 'value': 'clothing'},
            {'id': 13, 'name': 'Electronics', 'icon': '📱', 'color': '#AED6F1', 'value': 'electronics'},
            {'id': 14, 'name': 'Home & Garden', 'icon': '🏠', 'color': '#A9DFBF', 'value': 'home_garden'},
            {'id': 15, 'name': 'Gifts & Donations', 'icon': '🎁', 'color': '#F1948A', 'value': 'gifts_donations'},
            {'id': 16, 'name': 'Other', 'icon': '💰', 'color': '#D5DBDB', 'value': 'other'},
        ]
        return Response(categories)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset.order_by('-date', '-created_at')
    
    def create(self, request, *args, **kwargs):
        """Enhanced create method with detailed logging"""
        logger.info("=== DEBUG: Creating Expense ===")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request files: {request.FILES}")
        logger.info(f"Request user: {request.user}")
        
        # Clean the data before serialization
        data = request.data.copy()
        
        # Handle empty receipt_image
        if 'receipt_image' in data and (not data['receipt_image'] or data['receipt_image'] == ''):
            data.pop('receipt_image')
            logger.info("Removed empty receipt_image from data")
        
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            logger.error(f"❌ Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            expense = serializer.save()
            logger.info(f"✅ Expense created successfully: {expense.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"❌ Error creating expense: {str(e)}")
            return Response(
                {'error': 'Failed to create expense'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Enhanced update method with better error handling"""
        logger.info(f"=== DEBUG: Updating Expense {kwargs.get('pk')} ===")
        logger.info(f"Request data: {request.data}")
        
        # Clean the data before serialization
        data = request.data.copy()
        
        # Handle empty receipt_image
        if 'receipt_image' in data and (not data['receipt_image'] or data['receipt_image'] == ''):
            data.pop('receipt_image')
            logger.info("Removed empty receipt_image from data")
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        
        if not serializer.is_valid():
            logger.error(f"❌ Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            expense = serializer.save()
            logger.info(f"✅ Expense updated successfully: {expense.id}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"❌ Error updating expense: {str(e)}")
            return Response(
                {'error': 'Failed to update expense'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get expense statistics for the current user"""
        user_expenses = Expense.objects.filter(user=request.user)
        
        # Basic stats
        total_expenses = user_expenses.aggregate(total=Sum('amount'))['total'] or 0
        total_transactions = user_expenses.count()
        avg_transaction = user_expenses.aggregate(avg=Avg('amount'))['avg'] or 0
        
        # Top category
        top_category_data = user_expenses.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total').first()
        
        if top_category_data:
            # Get the display name for the category
            expense_obj = Expense(category=top_category_data['category'])
            top_category_name = expense_obj.category_name
        else:
            top_category_name = 'None'
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        for i in range(6):
            date = timezone.now() - timedelta(days=30*i)
            month_expenses = user_expenses.filter(
                date__year=date.year,
                date__month=date.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_trend.insert(0, {
                'month': calendar.month_name[date.month],
                'amount': float(month_expenses)
            })
        
        # Category breakdown
        category_breakdown = []
        category_data = user_expenses.values('category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')[:5]
        
        for item in category_data:
            expense_obj = Expense(category=item['category'])
            category_breakdown.append({
                'category__name': expense_obj.category_name,
                'category__color': expense_obj.category_color,
                'total': float(item['total']),
                'count': item['count']
            })
        
        stats_data = {
            'total_expenses': total_expenses,
            'total_transactions': total_transactions,
            'avg_transaction': avg_transaction,
            'top_category': top_category_name,
            'monthly_trend': monthly_trend,
            'category_breakdown': category_breakdown
        }
        
        serializer = ExpenseStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent expenses"""
        recent_expenses = self.get_queryset()[:10]
        serializer = self.get_serializer(recent_expenses, many=True)
        return Response(serializer.data)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user, is_active=True)
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get budget alerts for overspending"""
        budgets = self.get_queryset()
        alerts = []
        
        for budget in budgets:
            if budget.progress_percentage >= 80:
                alert_type = 'danger' if budget.progress_percentage >= 100 else 'warning'
                alerts.append({
                    'id': budget.id,
                    'category': budget.category_name,
                    'message': f"You've spent {budget.progress_percentage:.1f}% of your {budget.category_name} budget",
                    'type': alert_type,
                    'spent': budget.spent_amount,
                    'budget': budget.amount
                })
        
        return Response(alerts)