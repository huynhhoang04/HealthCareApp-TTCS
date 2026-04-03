from rest_framework import serializers
from .models import User
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
    # Lấy thêm tên món ăn từ bảng FoodItem để hiển thị ra UI cho đẹp (chỉ đọc)
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    
    # Tự động tính toán Calo nạp vào ngay tại Serializer
    calories = serializers.SerializerMethodField()

    class Meta:
        model = NutritionLog
        logged_at = serializers.DateTimeField(format="%H:%M", read_only=True)
        fields = ['id', 'food_item', 'food_name', 'meal_type', 'weight_in_grams', 'calories', 'logged_at']
        read_only_fields = ['logged_at']

    def get_calories(self, obj):
        if obj.food_item and obj.weight_in_grams:
            return round((obj.food_item.calories * obj.weight_in_grams) / 100, 1)
        return 0


# --- 2. SERIALIZER CHO TẬP LUYỆN ---
class WorkoutLogSerializer(serializers.ModelSerializer):
    # Lấy tên bài tập từ bảng Exercise
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)

    class Meta:
        model = WorkoutLog
        fields = ['id', 'exercise', 'exercise_name', 'duration_minutes', 'sets', 'reps', 'calories_burned', 'logged_at']
        # calories_burned đã được @property hoặc hàm save() trong models tự tính, nên ở đây chỉ đọc
        read_only_fields = ['calories_burned', 'logged_at']