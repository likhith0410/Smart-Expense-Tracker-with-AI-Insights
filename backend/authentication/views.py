# backend/authentication/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    logger.info(f"Registration attempt with data: {request.data}")
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            logger.info(f"User {user.username} registered successfully")
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response({
                'error': 'Failed to create user account'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    logger.warning(f"Registration failed with errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"Login attempt for username: {username}")
    
    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                token, created = Token.objects.get_or_create(user=user)
                logger.info(f"User {username} logged in successfully")
                
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'Login successful'
                })
            else:
                return Response({
                    'error': 'Account is deactivated'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            logger.warning(f"Failed login attempt for username: {username}")
            return Response({
                'error': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        'error': 'Username and password required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    """Logout user and delete token"""
    try:
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        logger.info(f"User {request.user.username} logged out successfully")
        return Response({'message': 'Logout successful'})
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def profile(request):
    """Get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)