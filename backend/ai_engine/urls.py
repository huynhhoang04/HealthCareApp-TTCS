from django.urls import path
from .views import CasualChatAPIView, CompleteDayAPIView, CompleteExerciseAPIView, CurrentPlanAPIView, GeneratePlanHybridAPIView, PlanDayDetailAPIView, WorkoutLogCreateOnPlanAPIView
urlpatterns = [
    path('chat/casual/', CasualChatAPIView.as_view(), name='ai-casual-chat'),
    path('plan/generate-hybrid/', GeneratePlanHybridAPIView.as_view(), name='ai-generate-hybrid'),
    path('plan/current/', CurrentPlanAPIView.as_view(), name='ai-current-plan'),
    path('plan/<int:plan_id>/day/<int:day_number>/', PlanDayDetailAPIView.as_view(), name='plan-day-detail'),
    path('workout/log/create/', WorkoutLogCreateOnPlanAPIView.as_view(), name='workout-log-create'),
    path('plan/day/complete/', CompleteDayAPIView.as_view(), name='complete-day'),
    path('plan/exercise/complete/', CompleteExerciseAPIView.as_view(), name='complete-exercise'),
]