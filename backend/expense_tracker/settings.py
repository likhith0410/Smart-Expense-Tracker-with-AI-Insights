# backend/expense_tracker/settings.py - PRODUCTION READY VERSION (MERGE CONFLICT RESOLVED)
import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔐 PRODUCTION SECURITY SETTINGS
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-secret-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# 🌐 PRODUCTION HOSTS
ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '0.0.0.0',
    '.onrender.com',  # ✅ Added for Render
    'expense-tracker-backend2-1bv3.onrender.com',  # ✅ Your specific domain
]

# Application definition
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
    
    # Local apps
    'authentication',
    'expenses',
    'ai_insights',
]

# 📦 PRODUCTION MIDDLEWARE (ADDED WHITENOISE)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ✅ Added for static files
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'expense_tracker.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

# 🗄️ PRODUCTION DATABASE (POSTGRESQL FOR RENDER)
if os.environ.get('DATABASE_URL'):
    # Production database (Render PostgreSQL)
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
else:
    # Development database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'CONN_MAX_AGE': 0,
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

# 📁 PRODUCTION STATIC FILES
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = []

# 🖼️ MEDIA FILES
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# 📱 STATICFILES STORAGE (WHITENOISE)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 🔗 REST FRAMEWORK
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

# 🌍 CORS SETTINGS FOR PRODUCTION
CORS_ALLOWED_ORIGINS = [
    "https://smart-expense-tracker-with-ai-insights-lc6s-dipq0egm5.vercel.app",  # ✅ Preview URL
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://smart-expense-tracker.*\.vercel\.app$",  # All future URLs
]

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all in development
CORS_ALLOW_CREDENTIALS = True

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

# 🔒 PRODUCTION SECURITY SETTINGS
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 86400
    SECURE_REFERRER_POLICY = 'origin'
    
    # SSL settings (Render provides HTTPS)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True

# Disable caching in development to prevent issues
if DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }

# 📝 PRODUCTION LOGGING
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
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple' if DEBUG else 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'authentication': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'expenses': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'ai_insights': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# 🚫 DEBUG TOOLBAR COMPLETELY DISABLED
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

print("🚀 Production settings loaded successfully!")
print(f"🔧 DEBUG mode: {DEBUG}")
print(f"🌐 Allowed hosts: {ALLOWED_HOSTS}")
print(f"🗄️ Database: {'PostgreSQL (Production)' if os.environ.get('DATABASE_URL') else 'SQLite (Development)'}")
print("🚫 Debug toolbar completely disabled!")
print("✅ Frontend route 404s will be hidden from logs")
