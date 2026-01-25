import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Phone,
  PhoneOff,
  PhoneIncoming,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import { Campaign } from '@/types/campaigns';
import { Lead } from '@/types/leads';
import { CallLog } from '@/types/calls';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CampaignStatsProps {
  campaign: Campaign;
  leads: Lead[];
  callLogs: CallLog[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function CampaignStats({ campaign, leads, callLogs }: CampaignStatsProps) {
  // Calculate stats
  const connectRate = campaign.total_calls_attempted > 0
    ? ((campaign.total_calls_connected / campaign.total_calls_attempted) * 100).toFixed(1)
    : '0';

  const appointmentRate = campaign.total_calls_connected > 0
    ? ((campaign.total_appointments_set / campaign.total_calls_connected) * 100).toFixed(1)
    : '0';

  const avgCallDuration = campaign.total_calls_connected > 0
    ? (campaign.total_minutes_talked / campaign.total_calls_connected).toFixed(1)
    : '0';

  // Lead status distribution
  const leadStatusData = leads.reduce((acc, lead) => {
    const status = lead.lead_status || 'new';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadStatusChartData = Object.entries(leadStatusData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Call status distribution
  const callStatusData = callLogs.reduce((acc, call) => {
    const status = call.call_status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const callStatusChartData = Object.entries(callStatusData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  // Calls by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const callsByDay = last7Days.map(date => {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const count = callLogs.filter(call => 
      call.created_at?.startsWith(date)
    ).length;
    return { name: dayName, calls: count };
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connect Rate</p>
                <p className="text-2xl font-bold">{connectRate}%</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointment Rate</p>
                <p className="text-2xl font-bold">{appointmentRate}%</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-2">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Call Duration</p>
                <p className="text-2xl font-bold">{avgCallDuration} min</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
                <p className="text-2xl font-bold">{campaign.total_minutes_talked.toFixed(0)}</p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-2">
                <Phone className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calls Over Time */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Calls Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {callsByDay.some(d => d.calls > 0) ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callsByDay}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="calls" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No call data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Call Outcomes</CardTitle>
            <CardDescription>Distribution of call statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {callStatusChartData.length > 0 ? (
              <div className="h-[200px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {callStatusChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {callStatusChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No call data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Lead Status Overview</CardTitle>
          <CardDescription>Current status of leads in this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {leadStatusChartData.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {leadStatusChartData.map((item, index) => (
                <div 
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.value} leads</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No leads assigned to this campaign yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
