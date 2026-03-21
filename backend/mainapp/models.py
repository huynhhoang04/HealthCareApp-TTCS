from django.db import models
from django.contrib.auth.models import AbstractUser

# hệ thống bảng cho user
class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False, max_length=255)

class UserProfile(models.Model):
    GENDER_CHOICES = [('Nam', 'Nam'), ('Nữ', 'Nữ')]
    GOAL_CHOICES = [
        ('Giảm cân', 'Giảm cân'),
        ('Tăng cơ', 'Tăng cơ'),
        ('Duy trì', 'Duy trì'),
        ('Cải thiện sức bền', 'Cải thiện sức bền'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    dob = models.DateField(null=True, blank=True)
    height = models.FloatField(help_text="Chiều cao (cm)")
    weight = models.FloatField(help_text="Cân nặng (kg)")
    
    body_fat_percentage = models.FloatField(null=True, blank=True, help_text="% mỡ cơ thể")
    waist_circumference = models.FloatField(null=True, blank=True, help_text="Vòng eo (cm)")
    hip_circumference = models.FloatField(null=True, blank=True, help_text="Vòng hông (cm)")
    neck_circumference = models.FloatField(null=True, blank=True, help_text="Vòng cổ (cm)")
    chest_circumference = models.FloatField(null=True, blank=True, help_text="Vòng ngực (cm)")
    
    activity_level = models.FloatField(default=1.2, help_text="Hệ số vận động 1.2 - 1.9")
    fitness_goal = models.CharField(max_length=255, choices=GOAL_CHOICES, default='Duy trì', help_text="Mục tiêu: Giảm cân, Tăng cơ...")
    target_weight = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Chỉ số cơ thể: {self.user.username}"
    
# hệ thống bảng dinh dưỡng
class FoodCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    def __str__(self): return self.name

class FoodItem(models.Model):
    category = models.ForeignKey(FoodCategory, on_delete=models.PROTECT, related_name='foods')
    name = models.CharField(max_length=255)
    calories = models.FloatField(help_text="Calo/100g")
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    fiber = models.FloatField(default=0)
    vitamin_info = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='foods/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self): return self.name

class NutritionLog(models.Model):
    MEAL_CHOICES = [('Sáng', 'Sáng'), ('Trưa', 'Trưa'), ('Chiều', 'Chiều'), ('Tối', 'Tối'), ('Phụ', 'Bữa phụ')]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    weight_in_grams = models.FloatField()
    logged_at = models.DateTimeField(auto_now_add=True)

# hệ thống bảng tập luyện
class ExerciseCategory(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Exercise(models.Model):
    category = models.ForeignKey(ExerciseCategory, on_delete=models.PROTECT)
    name = models.CharField(max_length=255)
    description = models.TextField()
    video_url = models.URLField(null=True, blank=True)
    met_value = models.FloatField(help_text="Chỉ số chuyển đổi năng lượng để tính Calo")
    muscle_group = models.CharField(max_length=100) 

    def __str__(self): return self.name

class WorkoutLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    duration_minutes = models.IntegerField()
    sets = models.IntegerField(null=True, blank=True)
    reps = models.IntegerField(null=True, blank=True)
    calories_burned = models.FloatField()
    logged_at = models.DateTimeField(auto_now_add=True)

    @property
    def auto_calculate_calories(self):
        user_weight = self.user.profile.weight
        met = self.exercise.met_value
        return round(met * user_weight * (self.duration_minutes / 60), 2)

# Create your models here.
