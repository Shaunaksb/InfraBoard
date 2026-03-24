from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.routers import DefaultRouter
from api.views import SignupView, UserLookupView, CurrentUserView, OrganizationViewSet, BoardViewSet, CardViewSet, TemplateViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'templates', TemplateViewSet, basename='template')

urlpatterns = [
    # Auth
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    
    # Users
    path('users/me/', CurrentUserView.as_view(), name='user_me'),
    path('users/lookup/', UserLookupView.as_view(), name='user_lookup'),
    
    # Cards (Nested under Boards/Columns)
    path('boards/<str:board_pk>/columns/<str:column_pk>/cards/', CardViewSet.as_view({'post': 'create'}), name='card-create'),
    path('boards/<str:board_pk>/cards/<str:pk>/', CardViewSet.as_view({'put': 'update', 'delete': 'destroy'}), name='card-detail'),
    path('boards/<str:board_pk>/cards/<str:pk>/attachments/', CardViewSet.as_view({'post': 'upload_attachment'}), name='card-attachments'),
    path('boards/<str:board_pk>/cards/<str:pk>/attachments/<str:attachment_id>/', CardViewSet.as_view({'delete': 'delete_attachment'}), name='card-attachment-detail'),
    
    # ViewSets (boards, organizations, templates)
    path('', include(router.urls)),
]
