from django.urls import path
from .views import CategoryListAPIView, ChangePasswordView, DashboardChartAPIView, ExerciseDetailAPIView, ExerciseListAPIView, FoodSearchAPIView, RegisterView, UserProfileView, WorkoutLogCreateAPIView, WorkoutTodayAPIView, NutritionTodayAPIView, NutritionLogCreateAPIView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),

    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),

    path('profile/', UserProfileView.as_view(), name='user-profile'),

    path('dashboard/chart-7-days/', DashboardChartAPIView.as_view(), name='dash-chart'),

    path('dashboard/nutrition/today/', NutritionTodayAPIView.as_view(), name='dash-nutrition'),

    path('dashboard/workout/today/', WorkoutTodayAPIView.as_view(), name='dash-workout'),

    path('dashboard/nutrition/log/create/', NutritionLogCreateAPIView.as_view(), name='nutrition-log-create'),

    path('dashboard/food/search/', FoodSearchAPIView.as_view(), name='food-search'),

    path('dashboard/workout/categories/', CategoryListAPIView.as_view(), name='workout-categories'),

    path('dashboard/workout/exercises/', ExerciseListAPIView.as_view(), name='workout-exercises'),

    path('dashboard/workout/exercises/<int:pk>/', ExerciseDetailAPIView.as_view(), name='exercise-detail'),
    
    path('dashboard/workout/log/create/', WorkoutLogCreateAPIView.as_view(), name='workout-log-create'),
]