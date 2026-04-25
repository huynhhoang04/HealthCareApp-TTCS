from django.contrib import admin
from .models import ExerciseCategory, FoodCategory, NutritionLog, User, UserProfile, FoodItem, Exercise, WorkoutLog #... 

admin.site.register(User)
admin.site.register(UserProfile)

# Register your models here.
@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'calories', 'is_verified')
    search_fields = ('name',)
    list_filter = ('category', 'is_verified')

@admin.register(ExerciseCategory)
class ExerciseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_group', 'met_value')
    search_fields = ('name',)
    list_filter = ('muscle_group',)

admin.site.register(NutritionLog)
admin.site.register(WorkoutLog)