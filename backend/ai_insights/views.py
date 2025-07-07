# backend/ai_insights/views.py - FIXED VERSION
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import tempfile
import os
from .ml_service import SpendingAnalyzer, ExpenseCategorizer, ReceiptOCR

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_insights(request):
    """Get AI-powered spending insights"""
    try:
        insights = SpendingAnalyzer.get_spending_insights(request.user)
        return Response({
            'insights': insights,
            'generated_at': timezone.now()
        })
    except Exception as e:
        return Response({
            'insights': [],
            'error': str(e),
            'generated_at': timezone.now()
        }, status=status.HTTP_200_OK)  # Return empty insights instead of error

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def budget_recommendations(request):
    """Get AI budget recommendations"""
    try:
        recommendations = SpendingAnalyzer.get_budget_recommendations(request.user)
        return Response({
            'recommendations': recommendations,
            'generated_at': timezone.now()
        })
    except Exception as e:
        # Return default recommendations on error
        default_recommendations = [
            {
                'category': 'Food & Dining',
                'recommended_amount': 5000.00,
                'reason': 'Start tracking your food expenses to get personalized recommendations',
                'confidence': 'low'
            },
            {
                'category': 'Transportation',
                'recommended_amount': 3000.00,
                'reason': 'Track your transportation costs for better budgeting',
                'confidence': 'low'
            }
        ]
        return Response({
            'recommendations': default_recommendations,
            'error': str(e),
            'generated_at': timezone.now()
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def categorize_expense(request):
    """Auto-categorize expense using AI"""
    title = request.data.get('title', '')
    description = request.data.get('description', '')
    
    if not title:
        return Response({
            'error': 'Title is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        category = ExpenseCategorizer.categorize_expense(title, description)
        
        return Response({
            'suggested_category': {
                'id': category.id if category else None,
                'name': category.name if category else 'Other',
                'icon': category.icon if category else '💰',
                'color': category.color if category else '#3B82F6'
            }
        })
    except Exception as e:
        return Response({
            'suggested_category': {
                'id': None,
                'name': 'Other',
                'icon': '💰',
                'color': '#3B82F6'
            },
            'error': str(e)
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_receipt(request):
    """Scan receipt image and extract expense data"""
    if 'receipt_image' not in request.FILES:
        return Response({
            'error': 'Receipt image is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    receipt_image = request.FILES['receipt_image']
    
    # Save image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
        for chunk in receipt_image.chunks():
            tmp_file.write(chunk)
        tmp_file_path = tmp_file.name
    
    try:
        # Extract data using OCR
        ocr_result = ReceiptOCR.extract_expense_data(tmp_file_path)
        
        if ocr_result['success']:
            # Auto-categorize based on merchant name
            try:
                category = ExpenseCategorizer.categorize_expense(
                    ocr_result['merchant'], 
                    ocr_result['raw_text']
                )
            except:
                category = None
            
            return Response({
                'amount': ocr_result['amount'],
                'merchant': ocr_result['merchant'],
                'suggested_category': {
                    'id': category.id if category else None,
                    'name': category.name if category else 'Other',
                    'icon': category.icon if category else '💰',
                    'color': category.color if category else '#3B82F6'
                },
                'raw_text': ocr_result['raw_text']
            })
        else:
            return Response({
                'error': 'Failed to process receipt image',
                'details': ocr_result.get('error', '')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'error': 'Failed to process receipt',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)