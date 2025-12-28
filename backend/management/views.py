from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student, Teacher, Course, AttendanceRecord
from .serializers import StudentSerializer, TeacherSerializer, CourseSerializer, AttendanceRecordSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all(self, request):
        """
        Deletes all students.
        """
        Student.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all(self, request):
        """
        Deletes all teachers.
        """
        Teacher.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Creates a course and associates it with a teacher.
        """
        # The frontend sends 'teacherId', which we use to find the Teacher object.
        teacher_id = request.data.get('teacherId')
        if not teacher_id:
            return Response({'error': 'Teacher ID not provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)

        # We create a mutable copy of the request data to pass to the serializer.
        # We replace 'teacherId' with a 'teacher' field containing the teacher's pk.
        data = request.data.copy()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, pk=None):
        course = self.get_object()
        student_id = request.data.get('studentId')
        if not student_id:
            return Response({'error': 'Student ID not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
            
        course.students.add(student)
        return Response(self.get_serializer(course).data)

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all(self, request):
        """
        Deletes all courses, as requested by the frontend.
        """
        Course.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all(self, request):
        """
        Deletes all attendance records.
        """
        AttendanceRecord.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# This new ViewSet is needed to handle the "deleteAllUsers" call from the frontend
class UserViewSet(viewsets.ViewSet):
    """
    A viewset for handling bulk user-related actions.
    """
    queryset = User.objects.none() 

    @action(detail=False, methods=['delete'], url_path='all')
    def delete_all_users(self, request):
        """
        Deletes all students and teachers, as requested by the frontend.
        """
        Student.objects.all().delete()
        Teacher.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
