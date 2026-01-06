from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError('The given username must be set')
        email = self.normalize_email(email)
        username=self.normalize_email(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    objects = CustomUserManager()

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student")
    name = models.CharField(max_length=100)
    dept = models.CharField(max_length=50)
    def __str__(self):
        return self.name


class Teacher(models.Model):
    user = models.OneToOneField(User,
        on_delete=models.CASCADE,
        related_name="teacher"
    )
    name = models.CharField(max_length=100)
    # email = models.EmailField(max_length=100,default="email@example.com")
    dept = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='courses')
    students = models.ManyToManyField(Student, related_name='courses')

    def __str__(self):
        return self.name

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('unmarked', 'Unmarked'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10)
    class Meta:
        unique_together = ('student', 'course', 'date')

    def __str__(self):
        return f"{self.student.name} - {self.course.name} - {self.date}"
class Feedback(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} → {self.course.name}"
        
class Notification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()

    role = models.CharField(
        max_length=20,
        choices=[
            ("student", "Student"),
            ("teacher", "Teacher"),
            ("all", "All"),
        ],
        default="all"
    )

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,      # ✅ IMPORTANT
        blank=True      # ✅ IMPORTANT
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
