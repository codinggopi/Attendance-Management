"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, UserPlus, BookUser, BrainCircuit, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { students, teachers, courses, attendanceRecords } from '@/lib/data';
import type { Student, Teacher } from '@/lib/types';
import { generateAttendanceSummary, predictStudentAbsence } from '@/ai/flows/predict-student-absence';

// --- Sub-components for Admin Dashboard ---

const StatsCards = () => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const attendanceRate = ((attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length / attendanceRecords.length) * 100).toFixed(1);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    <BookUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTeachers}</div>
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

const UserManagement = () => {
    const { toast } = useToast();

    const handleAddUser = (e: React.FormEvent, userType: string) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name');
        toast({
            title: `${userType} Added`,
            description: `${name} has been added to the system.`,
        });
        (e.target as HTMLFormElement).reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add or view users in the system.</CardDescription>
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
                                    <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.map(t => <TableRow key={t.id}><TableCell>{t.name}</TableCell><TableCell>{t.email}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>
                        <h3 className="font-semibold mb-2">Students</h3>
                        <div className="border rounded-md">
                        <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Grade</TableHead><TableHead>Email</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(s => <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell>{s.grade}</TableCell><TableCell>{s.email}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="add-student" className="mt-4">
                        <form className="space-y-4" onSubmit={(e) => handleAddUser(e, "Student")}>
                            <Input name="name" placeholder="Student Name" required /><Input name="email" type="email" placeholder="Student Email" required /><Input name="grade" type="number" placeholder="Grade" required /><Button type="submit" className="w-full">Add Student</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="add-teacher" className="mt-4">
                        <form className="space-y-4" onSubmit={(e) => handleAddUser(e, "Teacher")}>
                            <Input name="name" placeholder="Teacher Name" required /><Input name="email" type="email" placeholder="Teacher Email" required /><Button type="submit" className="w-full">Add Teacher</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const AiReports = () => {
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isPredictionsLoading, setIsPredictionsLoading] = useState(true);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    useEffect(() => {
        const fetchPredictions = async () => {
            setIsPredictionsLoading(true);
            const historicalData = JSON.stringify([{ date: '2023-10-02', status: 'present' }, { date: '2023-10-04', status: 'absent' }]);
            const scheduleData = JSON.stringify(courses.map(c => ({ name: c.name, schedule: c.schedule })));
            const results = await Promise.all(
              students.slice(0, 5).map(student => predictStudentAbsence({ studentId: student.id, historicalAttendanceData: historicalData, currentClassSchedule: scheduleData }).then(res => ({ ...res, studentName: student.name })))
            );
            setPredictions(results.filter(p => p.willBeAbsent));
            setIsPredictionsLoading(false);
        };
        fetchPredictions();
    }, []);

    const handleGenerateSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSummaryLoading(true);
        // This is a placeholder for the actual `generateAttendanceSummary` call
        const { output } = await generateAttendanceSummary({timeFrame: "last week", studentGroup: "all students"});
        setSummary(output?.summary || "Could not generate summary.");
        setIsSummaryLoading(false);
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
                        {isPredictionsLoading ? <div>Loading predictions...</div> : predictions.length > 0 ? (
                            <ul className="space-y-2">
                                {predictions.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 p-2 bg-secondary rounded-md text-sm"><AlertCircle className="h-4 w-4 text-destructive"/><strong>{p.studentName}:</strong> <span className="text-muted-foreground">{p.reason} ({(p.confidenceScore * 100).toFixed(0)}% confident)</span></li>
                                ))}
                            </ul>
                        ) : <div>No high-risk students identified.</div>}
                    </TabsContent>
                    <TabsContent value="summary" className="mt-4">
                        <form onSubmit={handleGenerateSummary} className="space-y-4">
                           <Button type="submit" disabled={isSummaryLoading} className="w-full">{isSummaryLoading ? 'Generating...' : 'Generate Weekly Summary'}</Button>
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
  return (
    <div className="space-y-6">
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagement />
        <AiReports />
      </div>
    </div>
  );
}
