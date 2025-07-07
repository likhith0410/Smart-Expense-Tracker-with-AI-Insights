# backend/expense_tracker/settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Application definition - Apps at root level
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Local apps - Simple names
    'authentication',
    'expenses',
    'ai_insights',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'expense_tracker.urls'

# Simplified TEMPLATES - no React build dependency
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Remove React build directory dependency
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'expense_tracker.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'CONN_MAX_AGE': 0,  # Don't reuse connections
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Remove React build static files dependency for now
STATICFILES_DIRS = []

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# CORS settings for React frontend - ENHANCED
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True

# Enhanced CORS headers to fix routing issues
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
]

# Disable caching in development to prevent issues
if DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }

# UPDATED LOGGING - Hide frontend route 404s
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'clean': {
            'format': '{levelname} "{message}"',
            'style': '{',
        },
    },
    'filters': {
        'skip_frontend_routes': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': lambda record: not any(route in record.getMessage() for route in [
                '/dashboard', '/expenses', '/reports', '/login', '/register',
                '/static/css/', '/static/js/', '/favicon.ico', '/manifest.json'
            ])
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'clean',
            'filters': ['skip_frontend_routes'],
        },
        'api_console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'WARNING',  # Show warnings but filter out frontend route 404s
            'propagate': False,
        },
        # API related logging (show all API calls)
        'authentication': {
            'handlers': ['api_console'],
            'level': 'INFO',
            'propagate': False,
        },
        'expenses': {
            'handlers': ['api_console'],
            'level': 'INFO',
            'propagate': False,
        },
        'ai_insights': {
            'handlers': ['api_console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: False,  # Always hide
}

# Remove debug toolbar from any middleware if it exists
MIDDLEWARE = [item for item in MIDDLEWARE if 'debug_toolbar' not in item.lower()]

# Remove debug toolbar from installed apps if it exists
INSTALLED_APPS = [app for app in INSTALLED_APPS if 'debug_toolbar' not in app.lower()]

# Additional debug disabling
SILENCED_SYSTEM_CHECKS = ['debug_toolbar.W006']

# Internal IPs (set to empty to disable debug toolbar detection)
INTERNAL_IPS = []

# Disable debug info in responses
DEBUG_PROPAGATE_EXCEPTIONS = False

print("🚫 Debug toolbar completely disabled!")
print("✅ Frontend route 404s will be hidden from logs")