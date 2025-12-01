'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, CheckCircle, X, Clock, Calendar } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { AttendanceRecord, AttendanceCreate } from '@/types';
import { toast } from 'sonner';

const attendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'leave', 'holiday']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

export default function EmployeeAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: '',
      status: 'leave',
      reason: '',
      notes: '',
    },
  });

  const fetchAttendance = async () => {
    try {
      const data = await employeeApi.getMyAttendance();
      setAttendance(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onSubmit = async (data: AttendanceFormData) => {
    setIsSubmitting(true);
    try {
      await employeeApi.submitAttendance(data as AttendanceCreate);
      toast.success('Attendance submitted successfully');
      setIsDialogOpen(false);
      form.reset();
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await employeeApi.checkIn();
      toast.success('Checked in successfully');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeApi.checkOut();
      toast.success('Checked out successfully');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check out');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; className: string } } = {
      present: { variant: 'default', className: 'bg-green-100 text-green-800' },
      absent: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      leave: { variant: 'secondary', className: 'bg-orange-100 text-orange-800' },
      holiday: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
    };
    
    const config = variants[status] || variants.absent;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(record => record.date.split('T')[0] === today);

  if (loading) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">My Attendance</h3>
            <p className="text-sm text-muted-foreground">
              Track your daily attendance and submit leave requests.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Attendance Request</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="leave">Leave</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter reason" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Today's Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAttendance ? (
                <div className="space-y-2">
                  {getStatusBadge(todayAttendance.status)}
                  {todayAttendance.check_in_time && (
                    <p className="text-sm text-muted-foreground">
                      Check-in: {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
                    </p>
                  )}
                  {todayAttendance.check_out_time && (
                    <p className="text-sm text-muted-foreground">
                      Check-out: {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Not Checked In
                  </Badge>
                  <div className="space-y-2">
                    <Button onClick={handleCheckIn} size="sm" className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  </div>
                </div>
              )}
              
              {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
                <Button onClick={handleCheckOut} variant="outline" size="sm" className="w-full mt-2">
                  <Clock className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Present Days:</span>
                  <span className="font-medium">
                    {attendance.filter(record => 
                      record.status === 'present' && 
                      new Date(record.date).getMonth() === new Date().getMonth()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Leave Days:</span>
                  <span className="font-medium">
                    {attendance.filter(record => 
                      record.status === 'leave' && 
                      new Date(record.date).getMonth() === new Date().getMonth()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Absent Days:</span>
                  <span className="font-medium">
                    {attendance.filter(record => 
                      record.status === 'absent' && 
                      new Date(record.date).getMonth() === new Date().getMonth()
                    ).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {attendance.length > 0 ? 
                    Math.round((attendance.filter(r => r.status === 'present').length / attendance.length) * 100) :
                    0
                  }%
                </div>
                <p className="text-sm text-muted-foreground">Overall</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {record.check_in_time ? 
                        new Date(record.check_in_time).toLocaleTimeString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.check_out_time ? 
                        new Date(record.check_out_time).toLocaleTimeString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>{record.reason || '-'}</TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}