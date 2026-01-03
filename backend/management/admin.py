from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Student, Teacher, Course, AttendanceRecord


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    fieldsets = UserAdmin.fieldsets + (
        ("Role Information", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role Information", {"fields": ("role",)}),
    )

    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")
    ordering = ("username",)


# -------------------------
# Student Admin
# -------------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "dept", "get_email")
    search_fields = ("name",  "dept", "user__email")

    @admin.display(description="Email")
    def get_email(self, obj):
        return obj.user.email
    

# -------------------------
# Teacher Admin
# -------------------------
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id","name", "get_email")

    @admin.display(description="Email")
    def get_email(self, obj):
        return obj.user.email
    
    

# -------------------------
# Course Admin
# -------------------------
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "teacher")
    list_filter = ("teacher",)
    search_fields = ("name",)
    filter_horizontal = ("students",)


# -------------------------
# Attendance Admin
# -------------------------
@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "date", "status")
    list_filter = ("status", "date", "course")
    search_fields = ("student__name", "course__name")
