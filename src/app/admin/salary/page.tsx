'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Employee, SalaryRecord } from '@/types';
import { toast } from 'sonner';

export default function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<{ [key: number]: SalaryRecord[] }>({});
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const employeesData = await adminApi.getAllEmployees();
      setEmployees(employeesData);

      // Fetch salary records for each employee
      const records: { [key: number]: SalaryRecord[] } = {};
      await Promise.all(
        employeesData.map(async (employee) => {
          try {
            const salaryData = await adminApi.getEmployeeSalaryRecords(employee.id);
            records[employee.id] = salaryData;
          } catch (error) {
            records[employee.id] = [];
          }
        })
      );
      setSalaryRecords(records);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateSalaryStatus = async (salaryId: number, status: 'pending' | 'paid') => {
    setUpdatingIds(prev => new Set([...prev, salaryId]));
    try {
      await adminApi.updateSalaryRecord(salaryId, { status });
      toast.success(`Salary status updated to ${status}`);
      await fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update salary status');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(salaryId);
        return newSet;
      });
    }
  };

  // Flatten all salary records for display
  const allSalaryRecords = employees.flatMap(employee => 
    (salaryRecords[employee.id] || []).map(record => ({
      ...record,
      employee
    }))
  );

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
          <h3 className="text-lg font-medium">Salary Records</h3>
          <p className="text-sm text-muted-foreground">
            Manage employee salary records and payment status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSalaryRecords.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allSalaryRecords.filter(record => record.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allSalaryRecords.filter(record => record.status === 'paid').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Salary Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSalaryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employee ? 
                        `${record.employee.first_name} ${record.employee.last_name}` : 
                        'Unknown'
                      }
                    </TableCell>
                    <TableCell>{record.month}/{record.year}</TableCell>
                    <TableCell>{record.basic_salary.toLocaleString()} BDT</TableCell>
                    <TableCell>{record.overtime.toLocaleString()} BDT</TableCell>
                    <TableCell>{record.bonus.toLocaleString()} BDT</TableCell>
                    <TableCell>{record.deductions.toLocaleString()} BDT</TableCell>
                    <TableCell className="font-medium">
                      {record.net_salary.toLocaleString()} BDT
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'paid' ? 'default' : 'secondary'}
                        className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {record.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => updateSalaryStatus(record.id, 'paid')}
                            disabled={updatingIds.has(record.id)}
                          >
                            {updatingIds.has(record.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Mark Paid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSalaryStatus(record.id, 'pending')}
                            disabled={updatingIds.has(record.id)}
                          >
                            {updatingIds.has(record.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Clock className="mr-2 h-4 w-4" />
                            )}
                            Mark Pending
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {allSalaryRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
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