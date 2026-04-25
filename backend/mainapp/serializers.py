from django.utils import timezone

from rest_framework import serializers
from .models import ExerciseCategory, User
from .models import UserProfile
from .models import NutritionLog, WorkoutLog, FoodItem, Exercise

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ['user']

class NutritionLogSerializer(serializers.ModelSerializer):
    calories = serializers.SerializerMethodField()
    food_name = serializers.SerializerMethodField()
    logged_time = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = NutritionLog
        fields = ['id', 'food_item', 'food_name', 'custom_food_name', 'custom_calories', 'meal_type', 'weight_in_grams', 'calories', 'logged_time', 'image']

    def get_calories(self, obj):
        if obj.food_item and obj.weight_in_grams:
            return round((obj.food_item.calories * obj.weight_in_grams) / 100, 1)
        elif obj.custom_calories:
            return obj.custom_calories
        return 0
    
    def get_food_name(self, obj):
        if obj.food_item:
            return obj.food_item.name
        elif obj.custom_food_name:
            return obj.custom_food_name
        return "Món ăn không xác định"
    
    def get_logged_time(self, obj):
        return timezone.localtime(obj.logged_at).strftime('%H:%M')
    
    def get_image(self, obj):
        # Trỏ sang bảng FoodItem để lấy ảnh
        if obj.food_item and obj.food_item.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.food_item.image.url)
            return obj.food_item.image.url
        return None
    
class WorkoutLogSerializer(serializers.ModelSerializer):
    # Lấy tên bài tập từ bảng Exercise
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutLog
        fields = ['id', 'exercise', 'exercise_name', 'duration_seconds', 'sets', 'reps', 'calories_burned', 'logged_at', 'image']
        # calories_burned đã được @property hoặc hàm save() trong models tự tính, nên ở đây chỉ đọc
        read_only_fields = ['calories_burned', 'logged_at']
    
    def get_image(self, obj):
        # Trỏ sang bảng Exercise để lấy ảnh
        if obj.exercise and obj.exercise.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.exercise.image.url)
            return obj.exercise.image.url
        return None

class NutritionLogCreateSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    logged_at = serializers.SerializerMethodField()
    class Meta:
        model = NutritionLog
        fields = ['food_item', 'custom_food_name', 'custom_calories', 'meal_type', 'weight_in_grams', 'logged_at', 'image']

    def get_image(self, obj):
        # Lấy link ảnh món ăn (nếu có) và biến nó thành URL tuyệt đối (http://127.0.0.1:8000/media/...)
        if obj.food_item and obj.food_item.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.food_item.image.url)
            return obj.food_item.image.url
        return None


    def validate(self, data):
        if data.get('food_item'):
            if not data.get('weight_in_grams'):
                raise serializers.ValidationError({"weight_in_grams": "Cần nhập trọng lượng (gram)."})
        elif data.get('custom_food_name'):
            if not data.get('custom_calories'):
                raise serializers.ValidationError({"custom_calories": "Cần nhập tổng lượng calo."})
        else:
            raise serializers.ValidationError("Vui lòng chọn món có sẵn hoặc nhập tên món mới.")
        return data
    
    def get_logged_at(self, obj):
        return timezone.localtime(obj.logged_at)
    
class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'calories', 'image']

class ExerciseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseCategory
        fields = ['id', 'name']

class ExerciseSerializer(serializers.ModelSerializer):
    categories = ExerciseCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'categories', 'met_value', 'muscle_group', 'video_url', 'image']

