# backend/expenses/views.py - Updated with better error handling
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

# Set up logging
logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.all()

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
            queryset = queryset.filter(category_id=category)
        
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
        top_category = user_expenses.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total').first()
        top_category_name = top_category['category__name'] if top_category else 'None'
        
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
        category_breakdown = list(user_expenses.values('category__name', 'category__color').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')[:5])
        
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
                    'category': budget.category.name,
                    'message': f"You've spent {budget.progress_percentage:.1f}% of your {budget.category.name} budget",
                    'type': alert_type,
                    'spent': budget.spent_amount,
                    'budget': budget.amount
                })
        
        return Response(alerts)