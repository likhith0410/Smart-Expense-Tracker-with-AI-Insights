# backend/expense_tracker/urls.py - FIXED VERSION
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Simple health check
def health_check(request):
    return JsonResponse({
        'status': 'healthy', 
        'message': 'Backend is running',
        'frontend_url': 'http://localhost:3000'
    })

# API status endpoint
def api_status(request):
    return JsonResponse({
        'api': 'ExpenseAI Backend',
        'version': '1.0.0',
        'status': 'running',
        'frontend': 'http://localhost:3000',
        'admin': 'http://127.0.0.1:8000/admin/',
        'endpoints': {
            'auth': '/api/auth/',
            'expenses': '/api/expenses/',
            'ai': '/api/ai/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/ai/', include('ai_insights.urls')),
    path('health/', health_check, name='health_check'),
    path('', api_status, name='api_status'),  # Root shows API info
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)