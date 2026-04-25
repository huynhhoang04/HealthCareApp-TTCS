from django.shortcuts import render
import requests
import json
from ai_engine.models import AIRecommendationPlan, PlanDayExercise, PlanDetail, PlanOption
from mainapp.models import Exercise, WorkoutLog
from datetime import date
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class CasualChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Nhận mảng lịch sử chat từ Frontend (ví dụ: [{"role": "user", "content": "Chào bạn"}])
        messages = request.data.get('messages', [])

        # 2. Lấy thông tin cá nhân từ UserProfile (nằm ở mainapp)
        user = request.user
        try:
            # Dùng getattr để lấy dữ liệu an toàn, nếu không có sẽ lấy giá trị mặc định
            current_weight = getattr(user.profile, 'weight', 'Chưa xác định')
            target_weight = getattr(user.profile, 'target_weight', 'Chưa xác định')
            fitness_goal = getattr(user.profile, 'fitness_goal', 'Duy trì sức khỏe cơ bản')
        except Exception:
            current_weight = 'Chưa xác định'
            target_weight = 'Chưa xác định'
            fitness_goal = 'Duy trì sức khỏe cơ bản'

        system_content = (
            "Giao tiếp bằng tiếng Việt. "
            "Bạn là một trợ lý ảo chuyên nghiệp về dinh dưỡng và thể hình. "
            f"Người dùng hiện tại đang có mức cân nặng: {current_weight}kg, "
            f"mục tiêu cân nặng: {target_weight}kg, "
            f"và mục tiêu thể hình chính: {fitness_goal}. "
            "Hãy trả lời ngắn gọn, thân thiện và tư vấn dựa trên đúng những mục tiêu này."
        )

        payload_messages = [{"role": "system", "content": system_content}] + messages

        ollama_url = "http://localhost:11434/api/chat"
        payload = {
            "model": "fitness-pt", 
            "messages": payload_messages,
            "stream": False 
        }

        try:
            response = requests.post(ollama_url, json=payload)
            response.raise_for_status() # Bắt lỗi nếu Ollama sập hoặc sai cổng
            
            ai_data = response.json()
            return Response({"message": ai_data.get('message')})
            
        except requests.exceptions.RequestException as e:
            return Response({"error": f"Lỗi kết nối đến AI Engine: {str(e)}"}, status=503)
        

class GeneratePlanHybridAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        days = int(request.data.get('days', 7))
        goal = request.data.get('goal', 'Duy trì') # Tăng cơ / Giảm mỡ / Duy trì
        location = request.data.get('location', 'Home') # Tại nhà / Phòng tập

        try:
            user_weight = getattr(user.profile, 'weight', 70)
            target_daily_calo = 500 if goal == 'Giảm mỡ' else 300 
        except Exception:
            user_weight = 70
            target_daily_calo = 400

        # ==========================================
        # BƯỚC 1: PYTHON LỌC BÀI TẬP (Tránh AI ảo giác)
        # ==========================================
        exercises_query = Exercise.objects.all()
        
        if location == 'Home':
            exercises_query = exercises_query.filter(categories__name__icontains='Home')
        elif location == 'Gym':
            exercises_query = exercises_query.filter(categories__name__icontains='Gym')

        if not exercises_query.exists():
            return Response({"error": "Không có bài tập nào trong DB khớp với yêu cầu của bạn!"}, status=400)

        allowed_exercises = [
            {"id": ex.id, "name": ex.name, "muscle": ex.muscle_group} 
            for ex in exercises_query[:30] 
        ]

        profile = request.user.profile
        today = date.today()
        age = today.year - profile.dob.year - ((today.month, today.day) < (profile.dob.month, profile.dob.day))

        # 3. Tính BMI từ height (cm) và weight (kg)
        # Công thức: $BMI = \frac{weight(kg)}{height(m)^2}$
        height_m = profile.height / 100
        bmi = round(profile.weight / (height_m * height_m), 1)
        body_fat = f"{profile.body_fat_percentage}%" if profile.body_fat_percentage else "Chưa xác định"
        target_wt = f"{profile.target_weight}kg" if profile.target_weight else "Chưa xác định"
        activity_lv = profile.activity_level if profile.activity_level else "Chưa xác định"

        micro_cycle_days = min(days, 7)
        # user_info = f"Giới tính: {profile.gender}, Tuổi: {age}, Cân nặng: {profile.weight}kg, Chiều cao: {profile.height}cm, BMI: {bmi}"

        user_info = (
            f"Giới tính: {profile.gender} | Tuổi: {age} | Chiều cao: {profile.height}cm | "
            f"Cân nặng hiện tại: {profile.weight}kg | Mục tiêu: {target_wt} | "
            f"Chỉ số BMI: {bmi} | Tỷ lệ mỡ: {body_fat} | Mức độ vận động (BMR factor): {activity_lv}"
        )

        # ==========================================
        # 2: OLLAMA 
        # ==========================================
        system_prompt = """
You are an elite, science-based fitness architect. Your sole function is to generate highly optimized, personalized workout plans.

STRICT PROTOCOLS (FAILURE IS NOT AN OPTION):
1. ZERO HALLUCINATION: You MUST ONLY select exercises from the provided "ALLOWED EXERCISES" list. Use the exact "id".
2. JSON ONLY: Your entire response MUST be a valid, parsable JSON object. NO markdown formatting (do not use ```json), NO introductory text, NO conversational filler. 
3. MANDATORY DURATION FORMULA: The 'duration_seconds' field MUST be mathematically calculated and > 0. 
   - Rule for Rep-based exercises: (sets * reps * 4 seconds execution time) + ((sets - 1) * 60 seconds rest time). Example: 3 sets of 12 reps = (3*12*4) + (2*60) = 144 + 120 = 264 seconds.
   - Rule for Hold-based exercises (e.g., Plank): Assign between 30 to 120 seconds based on the user's fitness level.
4. VIETNAMESE LOCALIZATION: The 'note' field for each day MUST be written in highly motivational, professional Vietnamese. It must logically explain why these specific exercises were chosen for the user's specific BMI and Goal.

REQUIRED JSON STRUCTURE:
{
  "plan": [
    {
      "day": 1,
      "note": "Tiếng Việt...",
      "exercises": [{"id": X, "sets": Y, "reps": Z, "duration_seconds": W}]
    }
  ]
}
"""

        user_message = (
            f"CLIENT BIOMETRICS: {user_info}\n"
            f"PRIMARY GOAL: {goal}\n"
            f"TRAINING ENVIRONMENT: {location}\n"
            f"CRITICAL TASK: Design EXACTLY ONE workout micro-cycle consisting of EXACTLY {micro_cycle_days} DAYS. "
            f"Distribute muscle groups logically. Day {micro_cycle_days} should focus on active recovery or stretching.\n"
            f"ALLOWED EXERCISES (JSON List): {json.dumps(allowed_exercises, ensure_ascii=False)}"
        )
        payload = {
            "model": "fitness-pt",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "stream": False,
            "format": "json"
        }

        try:
            response = requests.post("http://localhost:11434/api/chat", json=payload)
            response.raise_for_status()
            ai_output = response.json().get('message', {}).get('content', '{}')
            ai_output = ai_output.strip().replace('```json', '').replace('```', '')
            plan_data = json.loads(ai_output)

            print('đã nhận được plan từ AI') 
            # ==========================================
            # BƯỚC 3: PYTHON TÍNH TOÁN CALO & LƯU DATABASE
            # ==========================================
            with transaction.atomic():
                recommendation = AIRecommendationPlan.objects.create(user=user, status='Pending')
                
                option = PlanOption.objects.create(
                    recommendation_plan=recommendation,
                    title=f"Lộ trình {days} ngày ({location})",
                    description=f"Mục tiêu {goal}",
                    estimated_result=f"Dự kiến đốt {target_daily_calo} calo/ngày"
                )
                plan_list = plan_data.get('plan', [])
                if not plan_list:
                    return Response({"error": "AI không sinh được bài tập, hãy thử lại"}, status=500)
                for i in range(1, days + 1):
                    day_data = plan_list[(i - 1) % len(plan_list)]

                    # 1. Tạo bản ghi PlanDetail cho ngày thứ i
                    detail = PlanDetail.objects.create(
                        plan_option=option,
                        day_number=i, 
                        target_calories=target_daily_calo,
                        note=day_data.get('note', ''),
                        is_finished=False
                    )

                    # 2. Lấy đống bài tập TRONG day_data đó để tạo PlanDayExercise
                    for ex_data in day_data.get('exercises', []):
                        try:
                            ex_obj = Exercise.objects.get(id=ex_data['id'])
                            
                            ai_duration = ex_data.get('duration_seconds', 0)
                            suggested_sets = ex_data.get('sets', 3)
                            suggested_reps = ex_data.get('reps', 12)


                            if ai_duration <= 0:
                                ai_duration = suggested_sets * suggested_reps * 5

                            # Tính calo đốt cháy
                            duration_mins = ai_duration / 60
                            estimated_calo = (ex_obj.met_value * 3.5 * user_weight / 200) * duration_mins

                            PlanDayExercise.objects.create(
                                plan_detail=detail,
                                exercise=ex_obj,
                                suggested_sets=ex_data.get('sets', 3),
                                suggested_reps=ex_data.get('reps', 12),
                                duration_seconds=ex_data.get('duration_seconds', 300),
                                estimated_calories_burned=round(estimated_calo, 2)
                            )
                        except Exercise.DoesNotExist:
                            continue 

            return Response({
                "message": "Đã tạo lộ trình thành công", 
                "plan_id": recommendation.id
            })

        except Exception as e:
            return Response({"error": f"Lỗi hệ thống AI: {str(e)}"}, status=500)
        
class CurrentPlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Lấy Plan mới nhất
        plan = AIRecommendationPlan.objects.filter(
            user=request.user, 
            status__in=['Pending', 'Active']
        ).order_by('-id').first() 

        if not plan:
            return Response({"has_plan": False}) 

        # 2. Lấy Option
        option = plan.options.first()
        if not option:
            return Response({"has_plan": False})

        # 3. Tính toán tiến độ
        all_details = option.details.all().order_by('day_number')
        total_days = all_details.count()
        
        completed_details = all_details.filter(is_finished=True)
        completed_count = completed_details.count()

        # 4. Kiểm tra xem hôm nay đã bấm "Hoàn thành" ngày nào chưa
        today = timezone.now().date()
        is_today_done = completed_details.filter(updated_at__date=today).exists()

        # Ngày hiện tại để hiển thị mũi tên là ngày kế tiếp sau ngày đã xong
        if is_today_done:
            current_day = completed_count
        else:
            current_day = completed_count + 1
        
        # Nếu đã xong hết 30 ngày
        is_all_completed = completed_count >= total_days
        if current_day > total_days:
            current_day = total_days

        return Response({
            "has_plan": True,
            "plan_id": plan.id,
            "title": option.title,
            "current_day": current_day,
            "total_days": total_days,
            "is_today_done": is_today_done,       # Trả về để Frontend khóa nút
            "is_all_completed": is_all_completed # Trả về để hiện nút "Tạo lộ trình mới"
        })

class PlanDayDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, plan_id, day_number):
        # Truy vấn các bài tập dựa trên plan_id và số ngày
        day_exercises = PlanDayExercise.objects.filter(
            plan_detail__plan_option__recommendation_plan_id=plan_id,
            plan_detail__day_number=day_number
        ).select_related('exercise')

        if not day_exercises.exists():
            return Response({"error": "Không tìm thấy bài tập cho ngày này"}, status=404)

        data = []
        for item in day_exercises:
            image_url = request.build_absolute_uri(item.exercise.image.url) if item.exercise.image else None
            data.append({
                "id": item.exercise.id,
                "name": item.exercise.name,
                "video_url": item.exercise.video_url, # URL video để hiện ở trang tập
                "image": image_url, # URL ảnh bài tập
                "muscle": item.exercise.muscle_group,
                "sets": item.suggested_sets,   # Số set AI bảo tập
                "reps": item.suggested_reps,   # Số reps AI bảo tập
                "duration": item.duration_seconds, # Thời gian đếm ngược (giây)
                "plan_detail_id": item.plan_detail.id,
                "is_completed": item.is_completed # Dùng để đánh dấu hoàn thành ngày sau này
            })

        return Response(data)
    
class WorkoutLogCreateOnPlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        exercise_id = request.data.get('exercise_id')
        
        # 1. Ép kiểu về INT an toàn (Bọc số 0 đề phòng None, ép int đề phòng chuỗi "60")
        try:
            reps = int(request.data.get('reps') or 0)
            duration = int(request.data.get('duration_seconds') or 0)
        except ValueError:
            reps = 0
            duration = 0

        try:
            exercise = Exercise.objects.get(id=exercise_id)
            
            # 2. Xử lý an toàn cho cân nặng của User (Tránh sập nếu User chưa tạo Profile)
            try:
                user_weight = float(user.profile.weight or 70.0)
            except Exception: # Bắt luôn lỗi DoesNotExist của OneToOneField
                user_weight = 70.0
            
            # 3. Ép kiểu MET_VALUE về FLOAT để tránh chọi nhau với số 3.5
            met_value = float(exercise.met_value or 0.0)
            
            duration_mins = duration / 60.0
            calo_burned = (met_value * 3.5 * user_weight / 200.0) * duration_mins

            # Tạo bản ghi log tập luyện
            log = WorkoutLog.objects.create(
                user=user,
                exercise=exercise,
                sets=1,             # Đã đổi thành 'sets' chuẩn Model
                reps=reps,          # Đã đổi thành 'reps' chuẩn Model
                duration_seconds=duration,
                calories_burned=round(calo_burned, 2)
            )

            return Response({"message": "Đã lưu kết quả set!", "log_id": log.id})
            
        except Exercise.DoesNotExist:
            return Response({"error": "Bài tập không tồn tại"}, status=400)
        except Exception as e:
            # Nếu có lỗi khác thì trả về lỗi 400 rõ ràng chứ không sập 500
            return Response({"error": str(e)}, status=400)


class CompleteDayAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_detail_id = request.data.get('plan_detail_id')
        
        try:
            detail = PlanDetail.objects.get(id=plan_detail_id, plan_option__recommendation_plan__user=request.user)
            detail.is_finished = True
            detail.save()
            return Response({"message": "Chúc mừng! Bạn đã hoàn thành ngày tập này."})
        except PlanDetail.DoesNotExist:
            return Response({"error": "Không tìm thấy thông tin ngày tập"}, status=404)

class CompleteExerciseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Bắt 2 tham số: ID của ngày và ID của bài tập gốc
        p_detail_id = request.data.get('plan_detail_id')
        ex_id = request.data.get('exercise_id')

        try:
            # Tìm đích danh: Bài tập X nằm trong Ngày Y
            exercise_record = PlanDayExercise.objects.get(
                plan_detail_id=p_detail_id, 
                exercise_id=ex_id
            )
            exercise_record.is_completed = True
            exercise_record.save()
            
            return Response({"message": "Đã tick xanh chuẩn xác!"})
            
        except PlanDayExercise.DoesNotExist:
            # Trả về 404 nếu không tìm thấy tọa độ này
            return Response({"error": "Không tìm thấy bài tập trong ngày này"}, status=404)
            
        except PlanDayExercise.MultipleObjectsReturned:
            # Phòng trường hợp 1 ngày ông xếp 2 bài tập giống hệt nhau
            first_record = PlanDayExercise.objects.filter(
                plan_detail_id=p_detail_id, 
                exercise_id=ex_id, 
                is_completed=False
            ).first()
            
            if first_record:
                first_record.is_completed = True
                first_record.save()
                return Response({"message": "Đã tick xanh bài tập bị trùng!"})
            return Response({"error": "Lỗi dữ liệu"}, status=400)
# Create your views here.
