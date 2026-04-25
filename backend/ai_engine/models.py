from django.db import models 
from mainapp.models import User 

class AIRecommendationPlan(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Đang chờ xử lý'),
        ('Active', 'Đang thực hiện'),
        ('Completed', 'Đã hoàn thành'),
        ('Expired', 'Hết hạn'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"Gợi ý từ AI {self.user.username} - {self.created_at.strftime('%d/%m/%Y')}"

class PlanOption(models.Model):
    recommendation_plan = models.ForeignKey(AIRecommendationPlan, on_delete=models.CASCADE, related_name='options')
    title = models.CharField(max_length=200, help_text="Ví dụ: Giảm cân bền vững 4 tuần")
    description = models.TextField(help_text="Mô tả tổng quát về hướng tiếp cận của lộ trình")
    estimated_result = models.CharField(max_length=200, help_text="Kết quả dự kiến (VD: Giảm 2kg mỡ)")
    is_selected = models.BooleanField(default=False, help_text="Đánh dấu nếu người dùng chọn phương án này")

    def __str__(self):
        return f"Lựa chọn: {self.title} ({self.recommendation_plan.user.username})"

class PlanDetail(models.Model):
    """Lưu chi tiết lộ trình theo thời gian (Tuần/Ngày)"""
    plan_option = models.ForeignKey(PlanOption, on_delete=models.CASCADE, related_name='details')
    day_number = models.IntegerField(help_text="Ngày thứ mấy trong lộ trình")
    target_calories = models.FloatField(help_text="Lượng Calo mục tiêu mỗi ngày trong tuần này")
    note = models.TextField(null=True, blank=True, help_text="Lời khuyên cụ thể cho giai đoạn này")
    is_finished = models.BooleanField(default=False, help_text="Đánh dấu ngày tập này đã hoàn thành")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chi tiết tuần {self.day_number} - {self.plan_option.title}"
    
class PlanDayExercise(models.Model):
    plan_detail = models.ForeignKey(PlanDetail, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey('mainapp.Exercise', on_delete=models.CASCADE) 
    
    suggested_sets = models.IntegerField(default=3)
    suggested_reps = models.IntegerField(default=12)
    duration_seconds = models.IntegerField(help_text="Thời gian dự kiến tập bài này (giây)")
    
    estimated_calories_burned = models.FloatField(default=0)
    is_completed = models.BooleanField(default=False) 

    def __str__(self):
        return f"Ngày {self.plan_detail.day_number} - {self.exercise.name}"