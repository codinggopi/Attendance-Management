
"use client";
import { ThemeToggle } from '@/components/theme-toggle';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, UserPlus, BookUser, CheckCircle, XCircle, Clock, AlertCircle, FileText, Pencil, Check, X, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student, Teacher, Course, AttendanceRecord, AttendanceStatus } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as api from '@/lib/api';
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateCourse } from '@/lib/api';


// --- Sub-components for Admin Dashboard ---

const StatsCards = ({ studentCount, teacherCount, courseCount, attendanceRecords }: { studentCount: number, teacherCount: number, courseCount: number, attendanceRecords: AttendanceRecord[] }) => {
    const attendanceRate = attendanceRecords.length > 0 ? ((attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length / attendanceRecords.length) * 100).toFixed(1) : "0.0";

    return (
        <div className="grid gap-6 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{studentCount}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    <BookUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teacherCount}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{courseCount}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                </CardContent>
            </Card>
        </div>
    );
};

const UserManagement = ({ students, teachers, onAddStudent, onAddTeacher, onUpdateStudent, onUpdateTeacher, onDeleteStudent, onDeleteTeacher, onDeleteAllStudents, onDeleteAllTeachers }: { students: Student[], teachers: Teacher[], onAddStudent: (student: Omit<Student, 'id'>) => void, onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void, onUpdateStudent: (student: Student) => void, onUpdateTeacher: (teacher: Teacher) => void, onDeleteStudent: (id: number) => void, onDeleteTeacher: (id: number) => void, onDeleteAllStudents: () => void, onDeleteAllTeachers: () => void }) => {
    const { toast } = useToast();
    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
    const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
    const [editedStudent, setEditedStudent] = useState<Partial<Student>>({});
    const [editedTeacher, setEditedTeacher] = useState<Partial<Teacher>>({});

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const dept = formData.get('dept') as string;
        
        if (name && email && dept) {
            onAddStudent({ name, email, dept });
            toast({
                title: "Student Added",
                description: `${name} has been added to the system.`,
            });
            (e.target as HTMLFormElement).reset();
        }
    };

    const handleAddTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const dept = formData.get('dept') as string;

        if (name && email && dept) {
            onAddTeacher({ name, email, dept });
            toast({
                title: "Teacher Added",
                description: `${name} has been added to the system.`,
            });
            (e.target as HTMLFormElement).reset();
        }
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudentId(student.id);
        setEditedStudent(student);
    };

    const handleSaveStudent = () => {
        onUpdateStudent(editedStudent as Student);
        setEditingStudentId(null);
        setEditedStudent({});
        toast({ title: "Student Updated", description: "Student information has been saved." });
    };

    const handleCancelEditStudent = () => {
        setEditingStudentId(null);
        setEditedStudent({});
    };
    
    const handleDeleteStudentClick = (studentId: number) => {
        onDeleteStudent(studentId);
        toast({ title: "Student Deleted", description: "The student has been removed." });
    }

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacherId(teacher.id);
        setEditedTeacher(teacher);
    };

    const handleSaveTeacher = () => {
        onUpdateTeacher(editedTeacher as Teacher);
        setEditingTeacherId(null);
        setEditedTeacher({});
        toast({ title: "Teacher Updated", description: "Teacher information has been saved." });
    };

    const handleCancelEditTeacher = () => {
        setEditingTeacherId(null);
        setEditedTeacher({});
    };

    const handleDeleteTeacherClick = (teacherId: number) => {
        onDeleteTeacher(teacherId);
        toast({ title: "Teacher Deleted", description: "The teacher has been removed." });
    }
    
    const handleDeleteAllStudentsClick = () => {
        onDeleteAllStudents();
        toast({
            title: "All Students Deleted",
            description: "All student records have been cleared.",
            variant: "destructive",
        });
    }
    
    const handleDeleteAllTeachersClick = () => {
        onDeleteAllTeachers();
        toast({
            title: "All Teachers Deleted",
            description: "All teacher records have been cleared.",
            variant: "destructive",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add, view, or delete users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="view">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="view">View All</TabsTrigger>
                        <TabsTrigger value="add-student">Add Student</TabsTrigger>
                        <TabsTrigger value="add-teacher">Add Teacher</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Teachers</h3>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={teachers.length === 0}><Trash2 className="mr-2 h-4 w-4" /> Delete All Teachers</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all teachers data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllTeachersClick}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <div className="border rounded-md mb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.map(t => (
                                        <TableRow key={t.id}>
                                            {editingTeacherId === t.id ? (
                                                <>
                                                    <TableCell><Input value={editedTeacher.name} onChange={e => setEditedTeacher({ ...editedTeacher, name: e.target.value })} /></TableCell>
                                                    <TableCell><Input value={editedTeacher.dept} onChange={e => setEditedTeacher({ ...editedTeacher, dept: e.target.value })} /></TableCell>
                                                    <TableCell><Input type="email" value={editedTeacher.email} onChange={e => setEditedTeacher({ ...editedTeacher, email: e.target.value })} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleSaveTeacher()}><Check className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleCancelEditTeacher()}><X className="h-4 w-4" /></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{t.name}</TableCell>
                                                    <TableCell>{t.dept || 'N/A'}</TableCell>
                                                    <TableCell>{t.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditTeacher(t)}><Pencil className="h-4 w-4" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete {t.name}? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteTeacherClick(t.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Students</h3>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={students.length === 0}><Trash2 className="mr-2 h-4 w-4" /> Delete All Students</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all student data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllStudentsClick}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <div className="border rounded-md">
                        <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(s => (
                                        <TableRow key={s.id}>
                                            {editingStudentId === s.id ? (
                                                <>
                                                    <TableCell><Input value={editedStudent.name} onChange={e => setEditedStudent({ ...editedStudent, name: e.target.value })} /></TableCell>
                                                    <TableCell><Input value={editedStudent.dept} onChange={e => setEditedStudent({ ...editedStudent, dept: e.target.value })} /></TableCell>
                                                    <TableCell><Input type="email" value={editedStudent.email} onChange={e => setEditedStudent({ ...editedStudent, email: e.target.value })} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleSaveStudent()}><Check className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleCancelEditStudent()}><X className="h-4 w-4" /></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{s.name}</TableCell>
                                                    <TableCell>{s.dept}</TableCell>
                                                    <TableCell>{s.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditStudent(s)}><Pencil className="h-4 w-4" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete {s.name}? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteStudentClick(s.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="add-student" className="mt-4">
                        <form className="space-y-4" onSubmit={handleAddStudent}>
                            <Input name="name" placeholder="Student Name" required />
                            <Input name="email" type="email" placeholder="Student Email" required />
                            <Input name="dept" placeholder="Department" required />
                            <Button type="submit" className="w-full">Add Student</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="add-teacher" className="mt-4">
                        <form className="space-y-4" onSubmit={handleAddTeacher}>
                            <Input name="name" placeholder="Teacher Name" required />
                            <Input name="email" type="email" placeholder="Teacher Email" required />
                            <Input name="dept" placeholder="Department" required />
                            <Button type="submit" className="w-full">Add Teacher</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
const CourseManagement = ({
    teachers,
    courses,
    onAddCourse,
    onDeleteCourse,
    onDeleteAll,
    onUpdateCourse
}: {
    teachers: Teacher[];
    courses: Course[];
    onAddCourse: (course: Omit<Course, "id" | "studentIds">) => void;
    onDeleteCourse: (id: number) => void;
    onDeleteAll: () => void;
    onUpdateCourse: (course: Course) => void;
}) => {
    const { toast } = useToast();

  // ✅ NEW STATES (ONLY FOR EDIT)
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [editCourseName, setEditCourseName] = useState("");
    const [editTeacherId, setEditTeacherId] = useState<number | null>(null);

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const teacherId = formData.get("teacherId") as string;

    if (name && teacherId) {
        onAddCourse({ name, teacherId: parseInt(teacherId, 10) });
        toast({
        title: "Course Added",
        description: `${name} has been added.`,
        });
        (e.target as HTMLFormElement).reset();
    }
    };

    const handleDeleteCourseClick = (courseId: number) => {
        onDeleteCourse(courseId);
        toast({ title: "Course Deleted", description: "The course has been removed." });
    };

    const handleDeleteAllClick = () => {
        onDeleteAll();
        toast({
        title: "All Courses Deleted",
        description: "All course records have been cleared.",
        variant: "destructive",
    });
    };

  // ✅ OPEN EDIT
    const openEditCourse = (course: Course) => {
        setEditCourse(course);
        setEditCourseName(course.name);
        setEditTeacherId(course.teacherId);
    };

  // ✅ SAVE EDIT
    const handleUpdateCourse = async () => {
        if (!editCourse || editTeacherId === null) return;

    try {
        const updatedCourse = {
        ...editCourse,
        name: editCourseName,
        teacherId: editTeacherId,
        };

        await onUpdateCourse(updatedCourse);
        setEditCourse(null);
        setEditCourseName("");
        setEditTeacherId(null);

        toast({
            title: "Course Updated",
            description: "Course updated successfully",
        });
        setEditCourse(null);
    } catch {
        toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update course",
        });
    }
    };

    return (
    <Card>
        <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>Manage and add new courses to the system.</CardDescription>
        </div>

        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete All
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all course data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllClick}>
                Continue
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </CardHeader>

        <CardContent>
        <Tabs defaultValue="view">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View Courses</TabsTrigger>
            <TabsTrigger value="add-course">Add Course</TabsTrigger>
            </TabsList>
          {/* ================= VIEW COURSES ================= */}
            <TabsContent value="view" className="mt-4">
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {courses.map(course => {
                    const teacher = teachers.find(t => t.id === course.teacherId);
                    return (
                        <TableRow key={course.id}>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{teacher?.name || "N/A"}</TableCell>

                        <TableCell className="text-right flex justify-end gap-2">
                          {/* ✏️ EDIT */}
                            <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditCourse(course)}
                            >
                            <Pencil className="h-4 w-4" />
                            </Button>
                          {/* 🗑 DELETE */}
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{course.name}"?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteCourseClick(course.id)}
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
                </Table>
            </div>
            </TabsContent>

          {/* ================= ADD COURSE ================= */}
            <TabsContent value="add-course" className="mt-4">
            <form className="space-y-4" onSubmit={handleAddCourse}>
                <div>
                <Label>Course Name</Label>
                <Input name="name"
                placeholder="Enter Course Name "
                required
                className="
                    text-sm
                    font-sans
                    tracking-wide
                " />
                </div>

                <div>
                <Label>Teacher</Label>
                <Select name="teacherId" required>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                    {teachers.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                </Button>
            </form>
            </TabsContent>
        </Tabs>
        </CardContent>

      {/* ================= EDIT COURSE POPUP ================= */}
        <AlertDialog open={!!editCourse} onOpenChange={() => setEditCourse(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Edit Course</AlertDialogTitle>
            <AlertDialogDescription>Update course details</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
            <div>
                <Label>Course Name</Label>
                <Input
                value={editCourseName}
                onChange={e => setEditCourseName(e.target.value)}
                />
            </div>

            <div>
                <Label>Teacher</Label>
                <Select
                value={String(editTeacherId)}
                onValueChange={v => setEditTeacherId(Number(v))}
                >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {teachers.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            </div>

            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateCourse}>
                Save
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
        </Card>
    );
};

const AttendanceManagement = ({ students, courses, attendanceRecords, onDelete, onDeleteAll }: { students: Student[], courses: Course[], attendanceRecords: AttendanceRecord[], onDelete: (id: number) => void, onDeleteAll: () => void }) => {
    const { toast } = useToast();
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(attendanceRecords);
    const [selectedStudent, setSelectedStudent] = useState<string>("all");
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    });

    useEffect(() => {
        let records = [...attendanceRecords];

        if (selectedStudent !== "all") {
            records = records.filter(r => r.studentId === parseInt(selectedStudent, 10));
        }

        if (selectedCourse !== "all") {
            records = records.filter(r => r.courseId === parseInt(selectedCourse, 10));
        }

        if (date?.from && date?.to) {
            records = records.filter(r => {
                const recordDate = new Date(r.date);
                return recordDate >= date.from! && recordDate <= date.to!;
            });
        }
        
        setFilteredRecords(records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    }, [selectedStudent, selectedCourse, date, attendanceRecords]);
    
    const handleDeleteClick = (recordId: number) => {
        onDelete(recordId);
        toast({ title: "Record Deleted", description: "The attendance record has been removed." });
    }

    const handleDeleteAllClick = () => {
        onDeleteAll();
        toast({
            title: "All Attendance Records Deleted",
            description: "All attendance data has been cleared.",
            variant: "destructive",
        });
    };

    const getStatusBadge = (status: AttendanceStatus) => {
        switch (status) {
          case 'present':
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"><CheckCircle className="mr-1 h-3 w-3"/>Present</span>;
          case 'absent':
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full"><XCircle className="mr-1 h-3 w-3"/>Absent</span>;
          case 'late':
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full"><Clock className="mr-1 h-3 w-3"/>Late</span>;
          default:
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Unmarked</span>;
        }
    };


    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Attendance Management</CardTitle>
                    <CardDescription>Filter and view attendance records across the system.</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete All</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all attendance records from the application.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllClick}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="student-filter">Student</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger id="student-filter">
                                <SelectValue placeholder="All Students" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="course-filter">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger id="course-filter">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length > 0 ? filteredRecords.map(record => {
                                const student = students.find(s => s.id === record.studentId);
                                const course = courses.find(c => c.id === record.courseId);
                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{student?.name || 'Unknown'}</TableCell>
                                        <TableCell>{course?.name || 'Unknown'}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this attendance record? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteClick(record.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No records match the current filters.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


// --- Main Admin Dashboard Component ---

export default function AdminDashboard() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [studentsData, teachersData, coursesData, attendanceData] = await Promise.all([
            api.getStudents(),
            api.getTeachers(),
            api.getCourses(),
            api.getAttendanceRecords(),
        ]);
        setStudents(studentsData);
        setTeachers(teachersData);
        setCourses(coursesData);
        setAttendanceRecords(attendanceData);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load data from the server.",
        });
        console.error("Failed to fetch data:", error);
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [toast]);


  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
        const newStudent = await api.addStudent(studentData);
        setStudents(prev => [...prev, newStudent]);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not add student." });
    }
  };

  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    try {
        const newTeacher = await api.addTeacher(teacherData);
        setTeachers(prev => [...prev, newTeacher]);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not add teacher." });
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id' | 'studentIds'>) => {
    try {
        // ensure studentIds is provided (empty array for a new course) so it matches Omit<Course, 'id'>
        const newCourse = await api.addCourse({ ...courseData, studentIds: [] });
        setCourses(prev => [...prev, newCourse]);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not add course." });
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
        await api.updateStudent(updatedStudent);
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not update student." });
    }
  };

  const updateTeacher = async (updatedTeacher: Teacher) => {
    try {
        await api.updateTeacher(updatedTeacher);
        setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not update teacher." });
    }
  };

  const updateCourse = async (updatedCourse: Course) => {
  try {
    const saved = await api.updateCourse({
      id: updatedCourse.id,
      name: updatedCourse.name,
      teacherId: updatedCourse.teacherId,
      studentIds: updatedCourse.studentIds ?? [],
    });

    setCourses(prev =>
      prev.map(c => (c.id === saved.id ? saved : c))
    );

    toast({
      title: "Course Updated",
      description: "Course updated successfully",
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update course",
    });
  }
};


  const deleteStudent = async (studentId: number) => {
    try {
        await api.deleteStudent(studentId);
        setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete student." });
    }
  };

  const deleteTeacher = async (teacherId: number) => {
    try {
        await api.deleteTeacher(teacherId);
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete teacher." });
    }
  };

  const deleteCourse = async (courseId: number) => {
    try {
        await api.deleteCourse(courseId);
        setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete course." });
    }
  };
  
  const deleteAttendanceRecord = async (recordId: number) => {
    try {
        await api.deleteAttendanceRecord(recordId);
        setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete attendance record." });
    }
  };

  const deleteAllStudents = async () => {
    try {
        await api.deleteAllStudents();
        setStudents([]);
        // Also clear attendance for deleted students
        const remainingTeacherIds = new Set(teachers.map(t => t.id));
        setAttendanceRecords(prev => prev.filter(r => remainingTeacherIds.has(students.find(s => s.id === r.studentId)!.id))); 
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete all students." });
    }
  }

  const deleteAllTeachers = async () => {
    try {
        await api.deleteAllTeachers();
        setTeachers([]);
        // This will also impact courses and potentially attendance, you might want to handle that cascade
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete all teachers." });
    }
  }
  
  const deleteAllCourses = async () => {
    try {
        await api.deleteAllCourses();
        setCourses([]);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete all courses." });
    }
  }

  const deleteAllAttendanceRecords = async () => {
    try {
        await api.deleteAllAttendanceRecords();
        setAttendanceRecords([]);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete all attendance records." });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
        
      <StatsCards 
        studentCount={students.length} 
        teacherCount={teachers.length} 
        courseCount={courses.length}
        attendanceRecords={attendanceRecords}
        />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UserManagement 
          students={students} 
          teachers={teachers} 
          onAddStudent={addStudent} 
          onAddTeacher={addTeacher}
          onUpdateStudent={updateStudent}
          onUpdateTeacher={updateTeacher}
          onDeleteStudent={deleteStudent}
          onDeleteTeacher={deleteTeacher}
          onDeleteAllStudents={deleteAllStudents}
          onDeleteAllTeachers={deleteAllTeachers}
        />
        <CourseManagement 
            teachers={teachers}
            courses={courses}
            onAddCourse={addCourse}
            onDeleteCourse={deleteCourse}
            onDeleteAll={deleteAllCourses}
            onUpdateCourse={updateCourse}
        />
      </div>
       <AttendanceManagement 
        students={students} 
        courses={courses} 
        attendanceRecords={attendanceRecords} 
        onDelete={deleteAttendanceRecord}
        onDeleteAll={deleteAllAttendanceRecords}

        />
    </div>
  );
}
