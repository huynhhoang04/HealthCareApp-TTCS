import profile

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from .models import Exercise, ExerciseCategory, FoodItem, User
from .models import UserProfile, NutritionLog, WorkoutLog
from .serializers import ExerciseCategorySerializer, ExerciseSerializer, FoodItemSerializer, NutritionLogCreateSerializer, RegisterSerializer
from .serializers import UserProfileSerializer
from .serializers import NutritionLogSerializer, WorkoutLogSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password
from django.utils import timezone
import datetime

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) 
    serializer_class = RegisterSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Lấy profile = user trong token 
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Nếu chưa có profile (vừa đăng ký xong), trả về mã 404 để React biết đường chuyển sang trang Setup
            return Response({"message": "Người dùng chưa thiết lập hồ sơ"}, status=404)
        
    def post(self, request):
        try:
            # Nếu đã có hồ sơ rồi -> Cập nhật (Update)
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        except UserProfile.DoesNotExist:
            # Nếu chưa có hồ sơ -> Tạo mới (Create)
            serializer = UserProfileSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        
        
        return Response(serializer.errors, status=400)
    
def calculate_bmi(weight, height):
    if not height or not weight: return 0, "Chưa rõ"
    bmi = weight / ((height / 100) ** 2)
    if bmi < 18.5: status = "Thiếu cân"
    elif 18.5 <= bmi <= 24.9: status = "Bình thường"
    elif 25 <= bmi <= 29.9: status = "Thừa cân"
    else: status = "Béo phì"
    return round(bmi, 1), status

def calculate_target_calo(profile):
    if not profile.dob or not profile.weight or not profile.height: return 2000 
    
    today = timezone.localtime().date()
    age = today.year - profile.dob.year
    
    # Tính BMR (Mifflin-St Jeor)
    if profile.gender == 'Nam':
        bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * age) + 5
    else:
        bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * age) - 161
        
    # Tính TDEE
    tdee = bmr * profile.activity_level
    
    # Điều chỉnh theo mục tiêu
    if profile.fitness_goal == 'Giảm cân': target = tdee - 500
    elif profile.fitness_goal == 'Tăng cơ': target = tdee + 300
    else: target = tdee # Duy trì
    
    return round(target)

def calculate_target_calo_out(profile):
    """
    Tính lượng Calo mục tiêu cần đốt cháy qua tập luyện mỗi ngày.
    Thuật toán: Base Burn (5 kcal/kg) + Bù trừ theo mục tiêu.
    """
    if not profile or not profile.weight: 
        return 500 # Giá trị an toàn mặc định nếu user chưa cập nhật cân nặng
        
    # Mức đốt calo cơ bản qua vận động: trung bình 5 kcal cho mỗi 1kg thể trọng
    base_burn = profile.weight * 5
    
    if profile.fitness_goal == 'Giảm cân':
        target_out = base_burn + 250  # Phải tập cardio/HIIT nhiều hơn để ép mỡ
    elif profile.fitness_goal == 'Tăng cơ':
        target_out = base_burn + 50   # Chủ yếu tập tạ nặng, hạn chế cardio để tránh mất cơ
    elif profile.fitness_goal == 'Cải thiện sức bền':
        target_out = base_burn + 200  # Tập sức bền (chạy, bơi) tốn khá nhiều calo
    else: 
        # Duy trì vóc dáng
        target_out = base_burn + 100
        
    return round(target_out)

class DashboardChartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({"error": "Chưa có profile"}, status=400)

        # Tính BMI
        bmi_value, bmi_status = calculate_bmi(profile.weight, profile.height)
        full_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        gender = profile.gender
        time = timezone.localtime().strftime("%H:%M %d/%m/%Y")
        
        # Lấy dữ liệu 7 ngày qua
        today = timezone.localtime().date()
        chart_data = []
        
        for i in range(6, -1, -1):
            day = today - datetime.timedelta(days=i)
            
            # Tính Calo nạp vào (Công thức: số gram * calo_per_100g / 100)
            nutri_logs = NutritionLog.objects.filter(user=request.user, logged_at__date=day)
            calo_in = sum(
                (log.food_item.calories * log.weight_in_grams / 100) if log.food_item else (log.custom_calories or 0)
                for log in nutri_logs
            )
                        
            # Tính Calo đốt ra
            work_logs = WorkoutLog.objects.filter(user=request.user, logged_at__date=day)
            calo_out = sum(log.calories_burned for log in work_logs)

            # Format tên thứ
            days_vn = {0: 'T2', 1: 'T3', 2: 'T4', 3: 'T5', 4: 'T6', 5: 'T7', 6: 'CN'}
            day_label = "Hôm nay" if i == 0 else days_vn[day.weekday()]

            chart_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "day_label": day_label,
                "calo_in": round(calo_in, 1),
                "calo_out": round(calo_out, 1)
            })

        return Response({
            "user_metrics": {
                "full_name": full_name,
                "gender": gender,
                "time": time,
                "bmi": bmi_value,
                "bmi_status": bmi_status,
                "target_weight": profile.target_weight
            },
            "chart_data": chart_data
        })
    
class NutritionTodayAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        now = timezone.localtime(timezone.now())
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + datetime.timedelta(days=1)
        
        target_calo = calculate_target_calo(profile) if profile else 2000
        
        # 1. Lấy dữ liệu từ Database
        logs = NutritionLog.objects.filter(user=request.user, logged_at__gte=start_of_day, logged_at__lte=end_of_day).order_by('logged_at')
        
        serializer = NutritionLogSerializer(logs, many=True, context={'request': request})
        
        total_calo_in = sum(item['calories'] for item in serializer.data)

        return Response({
            "date": now.strftime("%Y-%m-%d"),
            "summary": {
                "target_calo_in": target_calo,
                "total_calo_in": round(total_calo_in, 1)
            },
            "logs": serializer.data  
        })

class WorkoutTodayAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        now = timezone.localtime(timezone.now())
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + datetime.timedelta(days=1)
        
        # 1. Lấy dữ liệu từ Database
        logs = WorkoutLog.objects.filter(user=request.user, logged_at__gte=start_of_day, logged_at__lte=end_of_day).order_by('logged_at')
        
        # 2. Bơm vào Serializer
        serializer = WorkoutLogSerializer(logs, many=True, context={'request': request})
        
        # 3. Tính tổng calo đốt ra
        total_calo_out = sum(item['calories_burned'] for item in serializer.data)

        target_calo_out = calculate_target_calo_out(profile)

        return Response({
            "date": now.strftime("%Y-%m-%d"),
            "summary": {
                "target_calo_out": target_calo_out, 
                "total_calo_out": round(total_calo_out, 1)
            },
            "logs": serializer.data 
        })
    
class NutritionLogCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = NutritionLogCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FoodSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if query:
            foods = FoodItem.objects.filter(name__unaccent__icontains=query)[:10]
        else:
            foods = FoodItem.objects.all().order_by('?')[:5]
            
        serializer = FoodItemSerializer(foods, many=True, context={'request': request})
        return Response(serializer.data)
    
class CategoryListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = ExerciseCategory.objects.all()
        serializer = ExerciseCategorySerializer(categories, many=True)
        return Response(serializer.data)
    
class ExerciseListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        category_id = request.GET.get('category_id')

        # Query cơ bản
        exercises = Exercise.objects.all()

        # Xử lý search
        if query:
            exercises = exercises.filter(name__unaccent__icontains=query)
            
        # Xử lý lọc
        if category_id:
            exercises = exercises.filter(categories__id=category_id)

        # Giới hạn 10 bài tập
        exercises = exercises.distinct()[:10]
        
        serializer = ExerciseSerializer(exercises, many=True, context={'request': request})
        return Response(serializer.data)
    
class ExerciseDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class WorkoutLogCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exercise_id = request.data.get('exercise')
        duration = request.data.get('duration_seconds')

        user_weight = getattr(request.user.profile, 'weight', 70) 
        exercise = Exercise.objects.get(id=exercise_id)
        calories = (exercise.met_value * 3.5 * user_weight / 200) * (duration / 60)

        WorkoutLog.objects.create(
            user=request.user,
            exercise=exercise,
            duration_seconds=duration,
            calories_burned=round(calories, 2)
        )
        return Response({"status": "success", "calories": calories})

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # 1. Kiểm tra đủ các trường
        if not all([old_password, new_password, confirm_password]):
            return Response({"error": "Vui lòng điền đầy đủ tất cả các trường."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Kiểm tra mật khẩu cũ có đúng không
        if not check_password(old_password, user.password):
            return Response({"error": "Mật khẩu hiện tại không chính xác."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Kiểm tra mật khẩu mới và xác nhận có khớp không
        if new_password != confirm_password:
            return Response({"error": "Mật khẩu mới và xác nhận mật khẩu không khớp."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Kiểm tra độ dài mật khẩu (Ví dụ tối thiểu 8 ký tự)
        if len(new_password) < 8:
            return Response({"error": "Mật khẩu mới phải có ít nhất 8 ký tự."}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Cập nhật mật khẩu mới (Django tự động Hash)
        user.set_password(new_password)
        user.save()

        return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)

# Create your views here.


