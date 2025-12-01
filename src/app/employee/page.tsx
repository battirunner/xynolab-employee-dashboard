'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, CreditCard, User } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { Employee, AttendanceRecord, SalaryRecord } from '@/types';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentSalary, setRecentSalary] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profileData, attendanceData, salaryData] = await Promise.all([
        employeeApi.getMyProfile(),
        employeeApi.getMyAttendance(),
        employeeApi.getMySalaryRecords(),
      ]);

      setProfile(profileData);
      
      // Find today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceData.find(record => 
        record.date.split('T')[0] === today
      );
      setTodayAttendance(todayRecord || null);

      // Get most recent salary record
      if (salaryData.length > 0) {
        const sorted = salaryData.sort((a, b) => 
          new Date(`${b.year}-${b.month}-01`).getTime() - 
          new Date(`${a.year}-${a.month}-01`).getTime()
        );
        setRecentSalary(sorted[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await employeeApi.checkIn();
      toast.success('Checked in successfully');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeApi.checkOut();
      toast.success('Checked out successfully');
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check out');
    }
  };

  if (loading || !profile) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className="flex items-center justify-center h-96">
          <Clock className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">
            Welcome back, {profile.first_name}!
          </h3>
          <p className="text-sm text-muted-foreground">
            Here's your dashboard overview for today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employee ID</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.employee_id}</div>
              <p className="text-xs text-muted-foreground">
                {profile.position}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAttendance ? (
                  <span className="text-green-600">Present</span>
                ) : (
                  <span className="text-red-600">Absent</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {todayAttendance?.check_in_time ? 
                  `Checked in at ${new Date(todayAttendance.check_in_time).toLocaleTimeString()}` :
                  'Not checked in'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.department}</div>
              <p className="text-xs text-muted-foreground">
                Since {new Date(profile.hire_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Salary</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${recentSalary ? recentSalary.net_salary.toLocaleString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentSalary ? (
                  <span className={recentSalary.status === 'paid' ? 'text-green-600' : 'text-orange-600'}>
                    {recentSalary.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                ) : (
                  'No records'
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Check-in/Check-out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!todayAttendance?.check_in_time ? (
                  <Button onClick={handleCheckIn} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                ) : !todayAttendance?.check_out_time ? (
                  <Button onClick={handleCheckOut} variant="outline" className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-800">
                      Work day completed!
                    </p>
                    <p className="text-xs text-green-600">
                      Checked out at {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/employee/profile"
                  className="flex items-center p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">View Profile</span>
                </a>
                <a
                  href="/employee/attendance"
                  className="flex items-center p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Clock className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">View Attendance</span>
                </a>
                <a
                  href="/employee/salary"
                  className="flex items-center p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">View Salary Records</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}