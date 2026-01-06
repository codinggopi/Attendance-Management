from urllib import request
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Notification,Feedback, Student, Teacher, Course, AttendanceRecord
from .serializers import ResetPasswordSerializer, StudentSerializer, TeacherSerializer, CourseSerializer, AttendanceRecordSerializer, LoginSerializer, FeedbackSerializer, NotificationSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.db.models import Q


User = get_user_model()
class LoginView(APIView):
    permission_classes : list[type] = []
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "username": user.username
        })
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail": "Logout successful"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResetPasswordView(APIView):
    permission_classes: list[type] = []
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        new_password = serializer.validated_data["new_password"]

        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Password reset successful"},
            status=status.HTTP_200_OK
        )

class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer
    queryset = Student.objects.all()

    def get_queryset(self):
        user = self.request.user
        

        if user.role in ["admin", "teacher"]:
            return Student.objects.all()

        if user.role == "student":
            try:
                return Student.objects.filter(user=user)
            except Student.DoesNotExist:
                return Student.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=False, methods=["delete"], url_path="all")
    def delete_all(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not allowed"}, status=403)

        with transaction.atomic():
            users = User.objects.filter(role="student")
            users.delete()   # ✅ THIS deletes both User + Student

        return Response(
            {"message": "All students deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
    )

    @action(detail=False, methods=["get"], url_path="my-courses")
    def my_courses(self, request):
        if request.user.role != "student":
            return Response({"detail": "Not allowed"}, status=403)

        student = Student.objects.get(user=request.user)
        serializer = CourseSerializer(student.courses.all(), many=True)
        return Response(serializer.data)

class TeacherViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        if request.user.role != "teacher":
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            teacher = Teacher.objects.get(user=request.user)
        except Teacher.DoesNotExist:
            return Response(
                {"detail": "Teacher profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(teacher)
        return Response(serializer.data)
    
    @action(detail=False,methods=['delete'],url_path='all')
    def delete_all(self,request):
        if request.user.role!='admin':
            return Response({"detail": "Not allowed"}, status=403)

        with transaction.atomic():
            users = User.objects.filter(role="teacher")
            users.delete() 

        return Response(
            {"message": "All teachers deleted successfully"},
            status=status.HTTP_204_NO_CONTENT)
    

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return Course.objects.all()

        if user.role == "teacher":
            teacher = Teacher.objects.filter(user=user).first()
            if not teacher:
                return Course.objects.none()
            return Course.objects.filter(teacher=teacher)

        if user.role == "student":
            student = Student.objects.filter(user=user).first()
            if not student:
                return Course.objects.none()
            return Course.objects.filter(students=student)

        return Course.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                {"detail": "Only admin can create courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        teacher_id = request.data.get("teacherId")
        if not teacher_id:
            return Response({"error": "Teacher ID required"}, status=400)

        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=404)

        data = request.data.copy()
        data["teacher"] = teacher.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="enroll-student")
    def enroll_student(self, request, pk=None):
        if request.user.role != "teacher":
            return Response({"detail": "Not allowed"}, status=403)

        course = self.get_object()
        student_id = request.data.get("student_id")

        if not student_id:
            return Response({"detail": "student_id is required"}, status=400)

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"detail": "Student not found"}, status=404)

        course.students.add(student)
        return Response(
            {"message": "Student enrolled successfully"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["delete"], url_path="all")
    def delete_all(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not allowed"}, status=403)

        Course.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return AttendanceRecord.objects.all()

        if user.role == "teacher":
            teacher = Teacher.objects.get(user=user)
            return AttendanceRecord.objects.filter(course__teacher=teacher)

        if user.role == "student":
            student = Student.objects.get(user=user)
            return AttendanceRecord.objects.filter(student=student)

        return AttendanceRecord.objects.none()

    def create(self, request, *args, **kwargs):
        student = request.data.get("student")
        course = request.data.get("course")
        date = request.data.get("date")

        if AttendanceRecord.objects.filter(
            student=student, course=course, date=date
        ).exists():
            raise ValidationError(
                "Attendance already exists for this student, course and date"
            )

        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    # ✅ ADMIN → DELETE ALL ATTENDANCE
    @action(detail=False, methods=["delete"], url_path="all")
    def delete_all(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not allowed"}, status=403)

        AttendanceRecord.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    # ✅ TEACHER → DELETE ATTENDANCE BY COURSE
    @action(
        detail=False,
        methods=["delete"],
        url_path=r"by-course/(?P<course_id>\d+)"
    )
    def delete_by_course(self, request, course_id=None):
        if request.user.role != "teacher":
            return Response({"detail": "Not allowed"}, status=403)

        teacher = Teacher.objects.get(user=request.user)

        AttendanceRecord.objects.filter(
            course__id=course_id,
            course__teacher=teacher
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        user = request.user

        if user.role != "student":
            return Response({"detail": "Only students allowed"}, status=403)

        student = Student.objects.get(user=user)

        records = AttendanceRecord.objects.filter(student=student)

        total = records.count()
        present = records.filter(status__in=["present", "late"]).count()

        overall_percentage = round((present / total) * 100, 1) if total > 0 else 0

        subject_data = []

        for course in student.courses.all():
            course_records = records.filter(course=course)
            total_c = course_records.count()
            present_c = course_records.filter(
                status__in=["present", "late"]
            ).count()

            percent = round((present_c / total_c) * 100, 1) if total_c > 0 else 0

            subject_data.append({
                "courseId": course.id,
                "courseName": course.name,
                "percentage": percent
            })

        return Response({
            "overall": overall_percentage,
            "subjects": subject_data
        })

# This new ViewSet is needed to handle the "deleteAllUsers" call from the frontend
class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    """
    A viewset for handling bulk user-related actions.
    """
    queryset = User.objects.all()

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all_users(self, request):
        """
        Deletes all students and teachers, as requested by the frontend.
        """
        Student.objects.all().delete()
        Teacher.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "teacher":
            return Feedback.objects.filter(teacher__user=user).select_related("student", "course")
        if user.role == "student":
            return Feedback.objects.filter(student__user=user).select_related("course")
        return Feedback.objects.none()

    def perform_create(self, serializer):
        # student = self.request.user.student
        # # student enrolled courses → teacher
        # course = student.courses.first()   # or logic based on context
        # teacher = course.teacher

        serializer.save(
            student=self.request.user.student,
            teacher=serializer.validated_data.get("course").teacher
        )
    
    @action(detail=False, methods=["get"], url_path="my")
    def my_feedback(self, request):
        user = request.user
        if user.role == "student":
            qs = Feedback.objects.filter(student__user=user)
        elif user.role == "teacher":
            qs = Feedback.objects.filter(teacher__user=user)
        else:
            qs = Feedback.objects.none()

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["delete"], url_path="delete-all")
    def delete_all(self, request):
        user = request.user

        if user.role != "teacher":
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        qs = Feedback.objects.filter(course__teacher__user=user)
        count = qs.count()
        qs.delete()

        return Response(
            {"deleted": count},
            status=status.HTTP_200_OK
        )
from django.db import models

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()

    def get_queryset(self):
        user = self.request.user

        # 👨‍🎓 STUDENT
        if user.role == "student":
            return Notification.objects.filter(
                Q(role="all") |
                Q(role=request.user.role) |
                Q(recipient=request.user)
            ).order_by("-created_at")

        # 👨‍🏫 TEACHER
        if user.role == "teacher":
            return Notification.objects.filter(
                models.Q(role="teacher") |
                models.Q(role="all") |
                models.Q(recipient=user)
            ).order_by("-created_at")

        # 👑 ADMIN
        return Notification.objects.all().order_by("-created_at")

    
    def perform_create(self, serializer):
        serializer.save(recipient=None)  # ✅ broadcast notification
        
    @action(detail=False, methods=["get"], url_path="my")
    def my_notifications(self, request):
        user = request.user

        qs = Notification.objects.filter(
            Q(role="all") |
            Q(role=user.role) |
            Q(recipient=user)
        ).order_by("-created_at")

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)