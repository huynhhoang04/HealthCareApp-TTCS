from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .models import UserProfile, NutritionLog, WorkoutLog
from .serializers import RegisterSerializer
from .serializers import UserProfileSerializer
from .serializers import NutritionLogSerializer, WorkoutLogSerializer
from rest_framework.permissions import IsAuthenticated
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
            # Lấy profile của chính cái thằng đang gửi token lên
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
            # Tự động gán user bằng cái user đang bọc trong Token
            serializer.save(user=request.user)
            return Response(serializer.data)
        
        # Nếu gửi sai định dạng (ví dụ chữ thay vì số)
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
            calo_in = sum((log.food_item.calories * log.weight_in_grams / 100) for log in nutri_logs)
            
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
        
        serializer = NutritionLogSerializer(logs, many=True)
        
        total_calo_in = sum(item['calories'] for item in serializer.data)

        return Response({
            "date": now.strftime("%Y-%m-%d"),
            "summary": {
                "target_calo_in": target_calo,
                "total_calo_in": round(total_calo_in, 1)
            },
            "logs": serializer.data  
        })


# --- 3. API TẬP LUYỆN HÔM NAY (ĐÃ ÁP DỤNG SERIALIZER) ---
class WorkoutTodayAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localtime().date()
        
        # 1. Lấy dữ liệu từ Database
        logs = WorkoutLog.objects.filter(user=request.user, logged_at__date=today).order_by('logged_at')
        
        # 2. Bơm vào Serializer
        serializer = WorkoutLogSerializer(logs, many=True)
        
        # 3. Tính tổng calo đốt ra
        total_calo_out = sum(item['calories_burned'] for item in serializer.data)

        return Response({
            "date": today.strftime("%Y-%m-%d"),
            "summary": {
                "target_calo_out": 500, # Tạm để hardcode mục tiêu đốt calo là 500
                "total_calo_out": round(total_calo_out, 1)
            },
            "logs": serializer.data # Mọi thứ đã có Serializer lo!
        })
# Create your views here.
