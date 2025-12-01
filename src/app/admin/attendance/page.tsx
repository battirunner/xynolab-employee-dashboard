'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Employee, AttendanceRecord } from '@/types';
import { toast } from 'sonner';

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchEmployees = async () => {
    try {
      const data = await adminApi.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (employeeId: string) => {
    if (!employeeId) return;
    
    setLoadingAttendance(true);
    try {
      const data = await adminApi.getEmployeeAttendance(parseInt(employeeId));
      setAttendanceRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeAttendance(selectedEmployee);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedEmployee]);

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; className: string; icon: any } } = {
      present: { variant: 'default', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      absent: { variant: 'destructive', className: 'bg-red-100 text-red-800', icon: X },
      leave: { variant: 'secondary', className: 'bg-orange-100 text-orange-800', icon: Clock },
      holiday: { variant: 'outline', className: 'bg-blue-100 text-blue-800', icon: Clock },
    };
    
    const config = variants[status] || variants.absent;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const selectedEmployeeData = employees.find(emp => emp.id.toString() === selectedEmployee);

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Employee Attendance</h3>
          <p className="text-sm text-muted-foreground">
            View and manage employee attendance records.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an employee to view their attendance" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {`${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedEmployeeData && (
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance for {selectedEmployeeData.first_name} {selectedEmployeeData.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceRecords.filter(record => record.status === 'present').length}
                  </div>
                  <p className="text-sm text-green-700">Present Days</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {attendanceRecords.filter(record => record.status === 'leave').length}
                  </div>
                  <p className="text-sm text-orange-700">Leave Days</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceRecords.filter(record => record.status === 'absent').length}
                  </div>
                  <p className="text-sm text-red-700">Absent Days</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceRecords.filter(record => record.status === 'holiday').length}
                  </div>
                  <p className="text-sm text-blue-700">Holidays</p>
                </div>
              </div>

              {loadingAttendance ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading attendance...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => {
                      const checkIn = record.check_in_time ? new Date(record.check_in_time) : null;
                      const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
                      
                      const workingHours = checkIn && checkOut ? 
                        ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1) : 
                        '-';

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.status)}
                          </TableCell>
                          <TableCell>
                            {checkIn ? checkIn.toLocaleTimeString() : '-'}
                          </TableCell>
                          <TableCell>
                            {checkOut ? checkOut.toLocaleTimeString() : '-'}
                          </TableCell>
                          <TableCell>
                            {workingHours !== '-' ? `${workingHours} hrs` : '-'}
                          </TableCell>
                          <TableCell>{record.reason || '-'}</TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                    {attendanceRecords.length === 0 && !loadingAttendance && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No attendance records found for this employee
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedEmployee && (
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>Select an employee to view their attendance records</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}