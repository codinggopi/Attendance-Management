"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, UserPlus, BookUser, BrainCircuit, AlertCircle, FileText, Pencil, Check, X, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { students as initialStudents, teachers as initialTeachers, courses as initialCourses, attendanceRecords } from '@/lib/data';
import type { Student, Teacher, Course } from '@/lib/types';
import { predictStudentAbsence } from '@/ai/flows/predict-student-absence';
import { generateAttendanceSummary } from '@/ai/flows/generate-attendance-summary';
import jsPDF from 'jspdf';
import { usePersistentState } from '@/hooks/use-persistent-state';
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
} from "@/components/ui/alert-dialog"

// --- Sub-components for Admin Dashboard ---

const StatsCards = ({ studentCount, teacherCount, courseCount }: { studentCount: number, teacherCount: number, courseCount: number }) => {
    const attendanceRate = ((attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length / attendanceRecords.length) * 100).toFixed(1);

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

const UserManagement = ({ students, teachers, onAddStudent, onAddTeacher, onUpdateStudent, onUpdateTeacher, onDeleteAll }: { students: Student[], teachers: Teacher[], onAddStudent: (student: Omit<Student, 'id'>) => void, onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void, onUpdateStudent: (student: Student) => void, onUpdateTeacher: (teacher: Teacher) => void, onDeleteAll: () => void }) => {
    const { toast } = useToast();
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [editedStudent, setEditedStudent] = useState<Partial<Student>>({});
    const [editedTeacher, setEditedTeacher] = useState<Partial<Teacher>>({});

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const grade = Number(formData.get('grade'));
        
        if (name && email && grade) {
            onAddStudent({ name, email, grade });
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

        if (name && email) {
            onAddTeacher({ name, email });
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
    
    const handleDeleteAllClick = () => {
        onDeleteAll();
        toast({
            title: "All Users Deleted",
            description: "All student and teacher records have been cleared.",
            variant: "destructive",
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Add, view, or delete users in the system.</CardDescription>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete All</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all student and teacher data from the application.
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
                <Tabs defaultValue="view">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="view">View All</TabsTrigger>
                        <TabsTrigger value="add-student">Add Student</TabsTrigger>
                        <TabsTrigger value="add-teacher">Add Teacher</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-4">
                        <h3 className="font-semibold mb-2">Teachers</h3>
                        <div className="border rounded-md mb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.map(t => (
                                        <TableRow key={t.id}>
                                            {editingTeacherId === t.id ? (
                                                <>
                                                    <TableCell><Input value={editedTeacher.name} onChange={e => setEditedTeacher({ ...editedTeacher, name: e.target.value })} /></TableCell>
                                                    <TableCell><Input type="email" value={editedTeacher.email} onChange={e => setEditedTeacher({ ...editedTeacher, email: e.target.value })} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleSaveTeacher()}><Check className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleCancelEditTeacher()}><X className="h-4 w-4" /></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{t.name}</TableCell>
                                                    <TableCell>{t.email}</TableCell>
                                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEditTeacher(t)}><Pencil className="h-4 w-4" /></Button></TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <h3 className="font-semibold mb-2">Students</h3>
                        <div className="border rounded-md">
                        <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Grade</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(s => (
                                        <TableRow key={s.id}>
                                            {editingStudentId === s.id ? (
                                                <>
                                                    <TableCell><Input value={editedStudent.name} onChange={e => setEditedStudent({ ...editedStudent, name: e.target.value })} /></TableCell>
                                                    <TableCell><Input type="number" value={editedStudent.grade} onChange={e => setEditedStudent({ ...editedStudent, grade: Number(e.target.value) })} /></TableCell>
                                                    <TableCell><Input type="email" value={editedStudent.email} onChange={e => setEditedStudent({ ...editedStudent, email: e.target.value })} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleSaveStudent()}><Check className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleCancelEditStudent()}><X className="h-4 w-4" /></Button>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{s.name}</TableCell>
                                                    <TableCell>{s.grade}</TableCell>
                                                    <TableCell>{s.email}</TableCell>
                                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEditStudent(s)}><Pencil className="h-4 w-4" /></Button></TableCell>
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
                            <Input name="name" placeholder="Student Name" required /><Input name="email" type="email" placeholder="Student Email" required /><Input name="grade" type="number" placeholder="Grade" required /><Button type="submit" className="w-full">Add Student</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="add-teacher" className="mt-4">
                        <form className="space-y-4" onSubmit={handleAddTeacher}>
                            <Input name="name" placeholder="Teacher Name" required /><Input name="email" type="email" placeholder="Teacher Email" required /><Button type="submit" className="w-full">Add Teacher</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const CourseManagement = ({ teachers, courses, onAddCourse }: { teachers: Teacher[], courses: Course[], onAddCourse: (course: Omit<Course, 'id' | 'studentIds'>) => void }) => {
    const { toast } = useToast();

    const handleAddCourse = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const teacherId = formData.get('teacherId') as string;
        const schedule = formData.get('schedule') as string;

        if (name && teacherId && schedule) {
            onAddCourse({ name, teacherId, schedule });
            toast({
                title: "Course Added",
                description: `${name} has been added.`,
            });
            (e.target as HTMLFormElement).reset();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage and add new courses to the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="view">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="view">View Courses</TabsTrigger>
                        <TabsTrigger value="add-course">Add Course</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-4">
                         <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Schedule</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map(course => {
                                        const teacher = teachers.find(t => t.id === course.teacherId);
                                        return (
                                            <TableRow key={course.id}>
                                                <TableCell>{course.name}</TableCell>
                                                <TableCell>{teacher?.name || 'N/A'}</TableCell>
                                                <TableCell>{course.schedule}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="add-course" className="mt-4">
                        <form className="space-y-4" onSubmit={handleAddCourse}>
                            <div>
                                <Label htmlFor="course-name">Course Name</Label>
                                <Input id="course-name" name="name" placeholder="e.g., Introduction to Physics" required />
                            </div>
                            <div>
                                <Label htmlFor="teacherId">Teacher</Label>
                                <Select name="teacherId" required>
                                    <SelectTrigger id="teacherId">
                                        <SelectValue placeholder="Select a teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(teacher => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="schedule">Schedule</Label>
                                <Input id="schedule" name="schedule" placeholder="e.g., MWF 10:00 AM" required />
                            </div>
                            <Button type="submit" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};


const AiReports = ({students, courses}: {students: Student[], courses: Course[]}) => {
    const { toast } = useToast();
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPredictions = async () => {
            if (students.length === 0 || courses.length === 0) {
                return;
            }
            setIsPredictionsLoading(true);
            setError(null);
            try {
                const historicalData = JSON.stringify([{ date: '2023-10-02', status: 'present' }, { date: '2023-10-04', status: 'absent' }]);
                const scheduleData = JSON.stringify(courses.map(c => ({ name: c.name, schedule: c.schedule })));
                
                const results = await Promise.all(
                    students.slice(0, 5).map(student => 
                        predictStudentAbsence({ studentId: student.id, historicalAttendanceData: historicalData, currentClassSchedule: scheduleData })
                            .then(res => ({ ...res, studentName: student.name }))
                            .catch(e => {
                                console.error(`Failed to get prediction for student ${student.id}:`, e);
                                return null; 
                            })
                    )
                );
                
                const validResults = results.filter((p): p is (NonNullable<typeof p>) => p !== null && p.willBeAbsent);
                setPredictions(validResults);
                if (results.some(r => r === null)) {
                    setError("Could not fetch all predictions. The AI model might be temporarily unavailable.");
                }

            } catch (e) {
                console.error(e);
                setError("Could not fetch predictions. The AI model might be temporarily unavailable.");
                toast({
                    variant: "destructive",
                    title: "Prediction Error",
                    description: "Failed to fetch absence predictions.",
                });
            } finally {
                setIsPredictionsLoading(false);
            }
        };
        fetchPredictions();
    }, [students, courses, toast]);

    const handleGenerateSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSummaryLoading(true);
        setSummary('');
        try {
            const { summary: summaryText } = await generateAttendanceSummary({timeFrame: "last week", studentGroup: "all students"});
            setSummary(summaryText || "Could not generate summary.");
            
            if (summaryText) {
                const doc = new jsPDF();
                doc.text(summaryText, 10, 10);
                doc.save("weekly-attendance-summary.pdf");
            }

        } catch (e) {
            console.error(e);
            setSummary("Failed to generate summary. The AI model might be temporarily unavailable.");
            toast({
                variant: "destructive",
                title: "Summary Error",
                description: "Failed to generate attendance summary.",
            });
        } finally {
            setIsSummaryLoading(false);
        }
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle>AI Reports & Insights</CardTitle>
                <CardDescription>Leverage AI to understand and predict attendance patterns.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="predictions">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="predictions"><AlertCircle className="mr-2 h-4 w-4" />Absence Predictions</TabsTrigger>
                        <TabsTrigger value="summary"><FileText className="mr-2 h-4 w-4" />Generate Summary</TabsTrigger>
                    </TabsList>
                    <TabsContent value="predictions" className="mt-4">
                        {isPredictionsLoading ? <div>Loading predictions...</div> : error ? <div className="text-destructive">{error}</div> : predictions.length > 0 ? (
                            <ul className="space-y-2">
                                {predictions.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 p-2 bg-secondary rounded-md text-sm"><AlertCircle className="h-4 w-4 text-destructive"/><strong>{p.studentName}:</strong> <span className="text-muted-foreground">{p.reason} ({(p.confidenceScore * 100).toFixed(0)}% confident)</span></li>
                                ))}
                            </ul>
                        ) : <div>No high-risk students identified.</div>}
                         {error && <div className="text-destructive mt-2">{error}</div>}
                    </TabsContent>
                    <TabsContent value="summary" className="mt-4">
                        <form onSubmit={handleGenerateSummary} className="space-y-4">
                           <Button type="submit" disabled={isSummaryLoading} className="w-full">{isSummaryLoading ? 'Generating...' : 'Generate Weekly Summary & Download PDF'}</Button>
                        </form>
                        {summary && <div className="mt-4 p-4 border rounded-md bg-secondary text-sm">{summary}</div>}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

// --- Main Admin Dashboard Component ---

export default function AdminDashboard() {
  const [students, setStudents] = usePersistentState<Student[]>('students', initialStudents);
  const [teachers, setTeachers] = usePersistentState<Teacher[]>('teachers', initialTeachers);
  const [courses, setCourses] = usePersistentState<Course[]>('courses', initialCourses);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
        id: `s${Date.now()}`,
        ...studentData
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
        id: `t${Date.now()}`,
        ...teacherData
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'studentIds'>) => {
    const newCourse: Course = {
        id: `c${Date.now()}`,
        studentIds: [],
        ...courseData
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };
  
  const deleteAllUsers = () => {
    setStudents([]);
    setTeachers([]);
  }

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="space-y-6">
      <StatsCards studentCount={students.length} teacherCount={teachers.length} courseCount={courses.length} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UserManagement 
          students={students} 
          teachers={teachers} 
          onAddStudent={addStudent} 
          onAddTeacher={addTeacher}
          onUpdateStudent={updateStudent}
          onUpdateTeacher={updateTeacher}
          onDeleteAll={deleteAllUsers}
        />
        <CourseManagement 
            teachers={teachers}
            courses={courses}
            onAddCourse={addCourse}
        />
      </div>
       <AiReports students={students} courses={courses} />
    </div>
  );
}
