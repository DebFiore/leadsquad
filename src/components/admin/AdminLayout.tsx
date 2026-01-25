import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Building2, 
  Mic, 
  Settings, 
  CreditCard,
  LogOut,
  ChevronDown,
  ExternalLink,
  Zap,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/leadsquad-logo-transparent.png';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Voice Library', href: '/admin/voices', icon: Mic },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Provisioning', href: '/admin/provisioning', icon: Zap },
  { name: 'Branding', href: '/admin/branding', icon: Palette },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { impersonatedOrg, exitImpersonation } = useAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const clearImpersonation = () => {
    exitImpersonation();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/admin" className="flex items-center gap-2">
                <img src={logo} alt="LeadSquad" className="h-8" />
                <span className="font-semibold text-sm text-primary">Admin</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/admin' && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link key={item.href} to={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn(
                          'gap-2',
                          isActive && 'bg-primary/10 text-primary'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {impersonatedOrg && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <span className="text-sm text-amber-500">
                    Viewing: {impersonatedOrg.name}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearImpersonation}
                    className="h-6 px-2 text-xs text-amber-500 hover:text-amber-400"
                  >
                    Exit
                  </Button>
                </div>
              )}

              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Client View
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Super Admin</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
