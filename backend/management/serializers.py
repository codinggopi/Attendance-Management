from typing import __all__
from rest_framework import serializers
from .models import Student, Teacher, Course, AttendanceRecord
from django.contrib.auth import authenticate
from .models import User
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class StudentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Student
        fields = [ "id", "name", "dept", "email"]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        email = user_data.get("email")  

        # ❌ Prevent duplicate user
        if User.objects.filter(username=email).exists():
            raise serializers.ValidationError({
                "email": "User with this email already exists"
            })

        # ✅ Atomic transaction (VERY IMPORTANT)
        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password="student@123",
                role="student"
            )

            student = Student.objects.create(
                user=user,
                **validated_data
            )

        return student
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)

        # 🔁 Update Student fields
        instance.name = validated_data.get("name", instance.name)
        instance.dept = validated_data.get("dept", instance.dept)
        instance.save()

        # 🔁 Update User email (if provided)
        if user_data:
            email = user_data.get("email")
            if email:
                if User.objects.exclude(id=instance.user.id).filter(username=email).exists():
                    raise serializers.ValidationError({
                        "email": "User with this email already exists"
                    })
                instance.user.email = email
                instance.user.username = email
                instance.user.save()

        return instance



class TeacherSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")
    # dept = serializers.CharField(max_length=100, allow_blank=True)

    class Meta:
        model = Teacher
        fields = ["id", "name", "dept", "email"]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        email = user_data["email"]

        if User.objects.filter(username=email).exists():
            raise serializers.ValidationError({
                "email": "User with this email already exists"
            })

        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password="teacher@123",
                role="teacher"
        )

            teacher = Teacher.objects.create(
                user=user,
                **validated_data
            )
        return teacher
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)

        # 🔁 Update Teacher fields
        instance.name = validated_data.get("name", instance.name)
        instance.dept = validated_data.get("dept", instance.dept)

        instance.save()

        # 🔁 Update User email (if provided)
        if user_data:
            email = user_data.get("email")
            if email:
                if User.objects.exclude(id=instance.user.id).filter(username=email).exists():
                    raise serializers.ValidationError({
                        "email": "User with this email already exists"
                    })
                instance.user.email = email
                instance.user.username = email
                instance.user.save()

        return instance



class CourseSerializer(serializers.ModelSerializer):
    teacherId = serializers.PrimaryKeyRelatedField(source='teacher', queryset=Teacher.objects.all())
    studentIds = serializers.PrimaryKeyRelatedField(many=True, queryset=Student.objects.all(), source='students', required=False)

    class Meta:
        model = Course
        fields = ['id', 'name', 'teacherId', 'studentIds']

class AttendanceRecordSerializer(serializers.ModelSerializer):
    studentId = serializers.PrimaryKeyRelatedField(
        source='student',
        queryset=Student.objects.all()
    )
    studentName = serializers.CharField(
        source='student.name',
        read_only=True
    )
    courseId = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all()
    )
    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'studentId',
            'studentName',   # ✅ ADD THIS
            'courseId',
            'date',
            'status'
        ]
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user

class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User does not exist")
        return value