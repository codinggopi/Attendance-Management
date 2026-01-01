from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student, Teacher, Course, AttendanceRecord
from .serializers import ResetPasswordSerializer, StudentSerializer, TeacherSerializer, CourseSerializer, AttendanceRecordSerializer, LoginSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from django.db import transaction



User = get_user_model()
class LoginView(APIView):
    permission_classes : list[type] = [IsAuthenticated]
    
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
        

        # Admin → see all attendance records
        if user.role == "admin":
            return AttendanceRecord.objects.all()


        # Teacher → see attendance records for their courses
        if user.role == "teacher":
            try:
                teacher = Teacher.objects.get(user=user)
                return AttendanceRecord.objects.filter(course__teacher=teacher)
            except Teacher.DoesNotExist:
                return AttendanceRecord.objects.none()

        # Student → see ONLY their own attendance records
        if user.role == "student":
            try:
                student = Student.objects.get(user=user)
                return AttendanceRecord.objects.filter(student=student)
            except Student.DoesNotExist:
                return AttendanceRecord.objects.none()

        # Others → no access (optional)
        return AttendanceRecord.objects.none()

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["delete"], url_path="all")
    def delete_all(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Not allowed"}, status=403)

        AttendanceRecord.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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
