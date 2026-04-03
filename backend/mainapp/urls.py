from django.urls import path
from .views import DashboardChartAPIView, RegisterView, UserProfileView, WorkoutTodayAPIView, NutritionTodayAPIView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),

    path('profile/', UserProfileView.as_view(), name='user-profile'),

    path('dashboard/chart-7-days/', DashboardChartAPIView.as_view(), name='dash-chart'),
    path('dashboard/nutrition/today/', NutritionTodayAPIView.as_view(), name='dash-nutrition'),
    path('dashboard/workout/today/', WorkoutTodayAPIView.as_view(), name='dash-workout'),
]