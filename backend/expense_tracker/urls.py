# backend/expense_tracker/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Simple health check
def health_check(request):
    return JsonResponse({'status': 'healthy', 'message': 'Backend is running'})

# Simple fallback for non-API routes (returns empty response to let React handle routing)
def spa_fallback(request):
    return HttpResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redirecting...</title>
        <script>
            // Redirect to React app on port 3000
            window.location.href = 'http://localhost:3000' + window.location.pathname;
        </script>
    </head>
    <body>
        <p>Redirecting to React app...</p>
    </body>
    </html>
    """)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/ai/', include('ai_insights.urls')),
    path('health/', health_check, name='health_check'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all pattern for non-API routes (MUST be last)
# This redirects to React dev server instead of trying to serve templates
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/|static/|health/).*$', spa_fallback, name='spa_fallback'),
]