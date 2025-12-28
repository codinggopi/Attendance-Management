from rest_framework import serializers
from .models import Student, Teacher, Course, AttendanceRecord

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    teacherId = serializers.PrimaryKeyRelatedField(source='teacher', queryset=Teacher.objects.all())
    studentIds = serializers.PrimaryKeyRelatedField(many=True, queryset=Student.objects.all(), source='students', required=False)

    class Meta:
        model = Course
        fields = ['id', 'name', 'teacherId', 'studentIds']

class AttendanceRecordSerializer(serializers.ModelSerializer):
    studentId = serializers.PrimaryKeyRelatedField(source='student', queryset=Student.objects.all())
    courseId = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all())

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'studentId', 'courseId', 'date', 'status']
