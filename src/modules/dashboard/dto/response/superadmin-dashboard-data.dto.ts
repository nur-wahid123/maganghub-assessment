import { Expose } from 'class-transformer';

export class SuperadminDashboardDataDto {
  @Expose({ name: 'total_active_school' })
  public totalActiveSchool: number;

  @Expose({ name: 'total_inactive_school' })
  public totalInactiveSchool: number;

  @Expose({ name: 'total_violations' })
  public totalViolations: number;

  @Expose({ name: 'total_users' })
  public totalUsers: number;

  @Expose({ name: 'total_students' })
  public totalStudents: number;

  @Expose({ name: 'most_violation_school' })
  public mostViolationSchool: {
    id: number;
    name: string;
    violationCount: number;
  };

  // Recent Activity
  @Expose({ name: 'violations_this_month' })
  public violationsThisMonth: number;

  @Expose({ name: 'violations_last_month' })
  public violationsLastMonth: number;
}
