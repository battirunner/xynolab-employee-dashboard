'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Building, Briefcase, DollarSign } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await employeeApi.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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

  if (!profile) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">My Profile</h3>
          <p className="text-sm text-muted-foreground">
            View your personal and employment information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm font-semibold">{profile.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm font-semibold">{profile.last_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-semibold">{profile.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm font-semibold">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm font-semibold">{profile.address}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                <p className="text-sm font-semibold">{profile.emergency_contact}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm font-semibold">{profile.employee_id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                    <p className="text-sm font-semibold">
                      {(() => {
                        try {
                          const date = new Date(profile.hire_date);
                          return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch {
                          return 'Not available';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* <Building className="h-4 w-4 text-muted-foreground" /> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm font-semibold">{profile.department}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <p className="text-sm font-semibold">{profile.position}</p>
              </div>

              <div className="flex items-center space-x-2">
                {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base Salary</label>
                  <p className="text-sm font-semibold">
                    {profile.base_salary ? `${profile.base_salary.toLocaleString()} BDT` : 'Not set'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-sm font-semibold">
                  {(() => {
                    try {
                      const date = new Date(profile.created_at);
                      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    } catch {
                      return 'Not available';
                    }
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work Anniversary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">
                  You've been with us for{' '}
                  {(() => {
                    try {
                      const hireDate = new Date(profile.hire_date);
                      if (isNaN(hireDate.getTime())) return '0';
                      const years = Math.floor((new Date().getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
                      return Math.max(0, years); // Ensure non-negative
                    } catch {
                      return '0';
                    }
                  })()} years
                </p>
                <p className="text-sm text-muted-foreground">
                  Thank you for your dedication and hard work!
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}