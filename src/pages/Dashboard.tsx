import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneNumbersSection } from '@/components/dashboard/PhoneNumbersSection';
import { UsageMonitor } from '@/components/dashboard/UsageMonitor';
import { 
  Users, 
  Bot, 
  Megaphone, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  {
    title: 'Total Leads',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Active Agents',
    value: '3',
    change: 'Deployed',
    trend: 'up',
    icon: Bot,
  },
  {
    title: 'Active Campaigns',
    value: '12',
    change: '-1',
    trend: 'down',
    icon: Megaphone,
  },
  {
    title: 'Conversion Rate',
    value: '24.3%',
    change: '+3.2%',
    trend: 'up',
    icon: TrendingUp,
  },
];

export default function Dashboard() {
  const { profile, organization } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with {organization?.name || 'your organization'} today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className={`flex items-center text-xs mt-1 ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Phone Numbers and Usage */}
        <div className="grid gap-6 lg:grid-cols-2">
          {organization?.id && (
            <>
              <PhoneNumbersSection organizationId={organization.id} />
              <UsageMonitor organizationId={organization.id} />
            </>
          )}
        </div>

        {/* Activity and Performance */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest lead interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Activity feed coming soon...
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Campaign performance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Charts coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
