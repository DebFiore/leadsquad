import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logoImage from '@/assets/leadsquad-logo-transparent.png';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Detect if we're on the admin subdomain
  const isAdminPortal = window.location.hostname === 'admin.leadsquad.ai' ||
    window.location.pathname.startsWith('/admin');

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If on admin portal, check if they're a superadmin before redirecting
        if (isAdminPortal) {
          const { data: adminData } = await supabase
            .from('superadmins')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (adminData) {
            // User is a superadmin, redirect to admin dashboard
            navigate('/admin');
          }
          // If not a superadmin, stay on auth page so they can sign out and use different credentials
        } else {
          // For client portal, redirect to dashboard
          navigate('/dashboard');
        }
      }
    };
    
    checkSession();
  }, [navigate, isAdminPortal]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out. Please sign in with admin credentials.');
  };

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate(isAdminPortal ? '/admin' : '/dashboard');
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <a href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </a>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={logoImage} 
              alt="LeadSquad" 
              className="h-10 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground">
              {isAdminPortal ? 'Admin Portal' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdminPortal 
                ? 'Sign in to access the admin dashboard'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {/* Sign out option for users who need to switch accounts */}
          {isAdminPortal && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              <button 
                onClick={handleSignOut}
                className="text-primary hover:underline"
              >
                Sign out of current session
              </button>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="you@company.com" 
                            type="email"
                            className="pl-10 bg-muted"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"}
                            className="pr-10 bg-muted"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}