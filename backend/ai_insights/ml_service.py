# backend/ai_insights/ml_service.py - FIXED VERSION
import re
from datetime import datetime, timedelta
from collections import Counter
from django.db.models import Sum, Count, Avg
from django.utils import timezone  # Use Django's timezone utils
from expenses.models import Expense, Category

class ExpenseCategorizer:
    """AI service for automatic expense categorization"""
    
    CATEGORY_KEYWORDS = {
        'Food & Dining': [
            'restaurant', 'cafe', 'food', 'pizza', 'burger', 'coffee', 'meal',
            'lunch', 'dinner', 'breakfast', 'snack', 'delivery', 'zomato', 'swiggy'
        ],
        'Transportation': [
            'uber', 'ola', 'taxi', 'bus', 'metro', 'fuel', 'petrol', 'diesel',
            'auto', 'rickshaw', 'transport', 'travel', 'flight', 'train'
        ],
        'Shopping': [
            'amazon', 'flipkart', 'mall', 'store', 'shopping', 'clothes',
            'dress', 'shoes', 'electronics', 'mobile', 'laptop', 'book'
        ],
        'Entertainment': [
            'movie', 'cinema', 'netflix', 'spotify', 'game', 'concert',
            'party', 'club', 'subscription', 'streaming'
        ],
        'Healthcare': [
            'doctor', 'hospital', 'medicine', 'pharmacy', 'health',
            'medical', 'clinic', 'treatment', 'checkup'
        ],
        'Utilities': [
            'electricity', 'water', 'gas', 'internet', 'phone', 'mobile',
            'bill', 'recharge', 'utility'
        ],
        'Education': [
            'course', 'book', 'education', 'school', 'college', 'training',
            'certification', 'learning'
        ]
    }
    
    @classmethod
    def categorize_expense(cls, title, description=""):
        """Categorize expense based on title and description"""
        text = f"{title} {description}".lower()
        
        category_scores = {}
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            try:
                return Category.objects.get(name=best_category)
            except Category.DoesNotExist:
                pass
        
        # Return default category if no match found
        return Category.objects.filter(name='Other').first()

class SpendingAnalyzer:
    """AI service for spending pattern analysis"""
    
    @staticmethod
    def get_spending_insights(user):
        """Generate AI-powered spending insights"""
        expenses = Expense.objects.filter(user=user)
        insights = []
        
        # Use timezone-aware datetime
        now = timezone.now()
        current_month = now.month
        current_year = now.year
        
        current_month_spending = expenses.filter(
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        last_month = current_month - 1 if current_month > 1 else 12
        last_year = current_year if current_month > 1 else current_year - 1
        
        last_month_spending = expenses.filter(
            date__month=last_month,
            date__year=last_year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        if last_month_spending > 0:
            change_percent = ((current_month_spending - last_month_spending) / last_month_spending) * 100
            if change_percent > 20:
                insights.append({
                    'type': 'warning',
                    'title': 'High Spending Alert',
                    'message': f'Your spending increased by {change_percent:.1f}% this month',
                    'value': change_percent
                })
            elif change_percent < -20:
                insights.append({
                    'type': 'success',
                    'title': 'Great Savings!',
                    'message': f'You saved {abs(change_percent):.1f}% compared to last month',
                    'value': abs(change_percent)
                })
        
        # Top spending category
        top_category = expenses.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total').first()
        
        if top_category:
            insights.append({
                'type': 'info',
                'title': 'Top Spending Category',
                'message': f'You spend most on {top_category["category__name"]}',
                'value': float(top_category['total'])
            })
        
        # Frequent small transactions
        small_transactions = expenses.filter(amount__lt=100).count()
        total_transactions = expenses.count()
        
        if total_transactions > 0 and (small_transactions / total_transactions) > 0.6:
            insights.append({
                'type': 'tip',
                'title': 'Small Transaction Pattern',
                'message': 'Consider bundling small purchases to reduce transaction frequency',
                'value': small_transactions
            })
        
        return insights
    
    @staticmethod
    def get_budget_recommendations(user):
        """Generate AI budget recommendations"""
        expenses = Expense.objects.filter(user=user)
        recommendations = []
        
        # Check if user has any expenses
        if not expenses.exists():
            return [{
                'category': 'Getting Started',
                'recommended_amount': 5000.00,
                'reason': 'Start tracking expenses to get personalized recommendations',
                'confidence': 'low'
            }]
        
        # Calculate average monthly spending by category
        category_averages = expenses.values('category__name').annotate(
            avg_amount=Avg('amount'),
            total_amount=Sum('amount'),
            count=Count('id')
        ).order_by('-total_amount')
        
        # Calculate user's active period in months (with timezone handling)
        now = timezone.now()
        user_joined = user.date_joined
        
        # Make user.date_joined timezone-aware if it isn't
        if timezone.is_naive(user_joined):
            user_joined = timezone.make_aware(user_joined)
        
        active_days = (now - user_joined).days
        active_months = max(1, active_days / 30)  # At least 1 month
        
        for category_data in category_averages:
            category_name = category_data['category__name']
            monthly_avg = category_data['total_amount'] / active_months
            
            recommended_budget = monthly_avg * 1.1  # 10% buffer
            
            recommendations.append({
                'category': category_name,
                'recommended_amount': round(recommended_budget, 2),
                'reason': f'Based on your average monthly spending of ₹{monthly_avg:.2f}',
                'confidence': 'high' if category_data['count'] > 5 else 'medium'
            })
        
        return recommendations[:5]  # Top 5 recommendations

class ReceiptOCR:
    """OCR service for receipt scanning"""
    
    @staticmethod
    def extract_expense_data(image_path):
        """Extract expense data from receipt image"""
        try:
            import pytesseract
            from PIL import Image
            
            # Open and process the image
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            
            # Extract amount using regex
            amount_pattern = r'(?:₹|Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)'
            amounts = re.findall(amount_pattern, text)
            
            # Extract merchant name (usually at the top)
            lines = text.strip().split('\n')
            merchant = lines[0] if lines else "Unknown Merchant"
            
            # Find the largest amount (likely the total)
            if amounts:
                total_amount = max([float(amt.replace(',', '')) for amt in amounts])
            else:
                # Fallback: look for any number with decimal
                number_pattern = r'\d+\.\d{2}'
                numbers = re.findall(number_pattern, text)
                total_amount = float(numbers[-1]) if numbers else 0.0
            
            return {
                'amount': total_amount,
                'merchant': merchant.strip(),
                'raw_text': text,
                'success': True
            }
            
        except Exception as e:
            return {
                'amount': 0.0,
                'merchant': '',
                'raw_text': '',
                'success': False,
                'error': str(e)
            }