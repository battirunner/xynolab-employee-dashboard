'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { SalaryRecord } from '@/types';
import { toast } from 'sonner';

export default function EmployeeSalaryPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSalaryRecords = async () => {
    try {
      const data = await employeeApi.getMySalaryRecords();
      setSalaryRecords(data.sort((a, b) => 
        new Date(`${b.year}-${b.month}-01`).getTime() - 
        new Date(`${a.year}-${a.month}-01`).getTime()
      ));
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast.error('Failed to load salary records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  if (loading) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentSalary = salaryRecords.find(
    record => record.month === currentMonth.toString().padStart(2, '0') && record.year === currentYear
  );

  const totalEarnings = salaryRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.net_salary, 0);

  const paidRecords = salaryRecords.filter(record => record.status === 'paid').length;
  const pendingRecords = salaryRecords.filter(record => record.status === 'pending').length;

  return (
    <DashboardLayout requiredRole="employee">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">My Salary Records</h3>
          <p className="text-sm text-muted-foreground">
            View your salary history and payment status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentSalary ? `${currentSalary.net_salary.toLocaleString()} BDT` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentSalary ? (
                  <span className={currentSalary.status === 'paid' ? 'text-green-600' : 'text-orange-600'}>
                    Status: {currentSalary.status}
                  </span>
                ) : (
                  'No record for current month'
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEarnings.toLocaleString()} BDT</div>
              <p className="text-xs text-muted-foreground">
                From {paidRecords} paid salaries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Records</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidRecords}</div>
              <p className="text-xs text-muted-foreground">
                Out of {salaryRecords.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRecords}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {currentSalary && (
          <Card>
            <CardHeader>
              <CardTitle>Current Month Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Basic Salary:</span>
                    <span className="font-medium">{currentSalary.basic_salary.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overtime:</span>
                    <span className="font-medium text-green-600">+{currentSalary.overtime.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bonus:</span>
                    <span className="font-medium text-green-600">+{currentSalary.bonus.toLocaleString()} BDT</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Deductions:</span>
                    <span className="font-medium text-red-600">-{currentSalary.deductions.toLocaleString()} BDT</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Net Salary:</span>
                      <span className="text-lg font-bold">{currentSalary.net_salary.toLocaleString()} BDT</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={currentSalary.status === 'paid' ? 'default' : 'secondary'}
                      className={currentSalary.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                    >
                      {currentSalary.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.month}/{record.year}</TableCell>
                    <TableCell>{record.basic_salary.toLocaleString()} BDT</TableCell>
                    <TableCell className="text-green-600">+{record.overtime.toLocaleString()} BDT</TableCell>
                    <TableCell className="text-green-600">+{record.bonus.toLocaleString()} BDT</TableCell>
                    <TableCell className="text-red-600">-{record.deductions.toLocaleString()} BDT</TableCell>
                    <TableCell className="font-medium">{record.net_salary.toLocaleString()} BDT</TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'paid' ? 'default' : 'secondary'}
                        className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(record.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {salaryRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No salary records found
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