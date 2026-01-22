import { 
  LayoutDashboard, 
  Bot, 
  Megaphone, 
  Users, 
  Puzzle, 
  Settings,
  LogOut,
  Building2
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/leadsquad-logo-transparent.png';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Agents', url: '/dashboard/agents', icon: Bot },
  { title: 'Campaigns', url: '/dashboard/campaigns', icon: Megaphone },
  { title: 'Leads', url: '/dashboard/leads', icon: Users },
  { title: 'Integrations', url: '/dashboard/integrations', icon: Puzzle },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, profile, organization, signOut } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="LeadSquad" 
            className={collapsed ? 'h-8 w-8 object-contain' : 'h-8 object-contain'}
          />
        </div>
        {!collapsed && organization && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-sidebar-accent p-2">
            <Building2 className="h-4 w-4 text-sidebar-foreground/70" />
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {organization.name}
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
