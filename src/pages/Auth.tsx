import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Loader2, Mail, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import logoImage from '@/assets/leadsquad-logo-transparent.png';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type AuthFormValues = z.infer<typeof authSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user is coming from successful Stripe payment
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const isPostPaymentFlow = paymentStatus === 'success' && sessionId;

  // Legacy: Check if user is coming from pricing checkout (old flow)
  const redirectType = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const isCheckoutFlow = redirectType === 'checkout' && priceId;

  // Detect if we're on the admin subdomain
  const isAdminPortal = window.location.hostname === 'admin.leadsquad.ai' ||
    window.location.pathname.startsWith('/admin');

  // Default to signup mode when coming from payment or checkout flow
  useEffect(() => {
    if ((isPostPaymentFlow || isCheckoutFlow) && !isAdminPortal) {
      setIsSignUp(true);
      // Store the session ID for linking after account creation
      if (sessionId) {
        localStorage.setItem('pendingStripeSessionId', sessionId);
      }
      // Legacy: store priceId if coming from old checkout flow
      if (priceId) {
        localStorage.setItem('pendingCheckoutPriceId', priceId);
      }
    }
  }, [isPostPaymentFlow, isCheckoutFlow, isAdminPortal, sessionId, priceId]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
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
            navigate('/admin');
          }
        } else if (isPostPaymentFlow || isCheckoutFlow) {
          // If coming from payment/checkout, redirect to onboarding
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    };
    
    checkSession();
  }, [navigate, isAdminPortal, isPostPaymentFlow, isCheckoutFlow]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out. Please sign in with admin credentials.');
  };

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up flow
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        toast.success('Account created! Redirecting to setup...');
        navigate('/onboarding');
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        
        if (isPostPaymentFlow || isCheckoutFlow) {
          navigate('/onboarding');
        } else {
          navigate(isAdminPortal ? '/admin' : '/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.message?.includes('User already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
        setIsSignUp(false);
      } else {
        toast.error(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine header text based on context
  const getHeaderText = () => {
    if (isAdminPortal) return 'Admin Portal';
    if (isPostPaymentFlow) return 'Payment Successful!';
    if (isCheckoutFlow) return isSignUp ? 'Create your account' : 'Welcome back';
    return 'Welcome back';
  };

  const getSubheaderText = () => {
    if (isAdminPortal) return 'Sign in to access the admin dashboard';
    if (isPostPaymentFlow) {
      return isSignUp 
        ? 'Create your account to activate your subscription' 
        : 'Sign in to activate your subscription';
    }
    if (isCheckoutFlow) {
      return isSignUp 
        ? 'Sign up to continue with your subscription' 
        : 'Sign in to continue with your subscription';
    }
    return 'Enter your credentials to access your dashboard';
  };

  // Show signup/signin toggle for payment or checkout flows
  const showToggle = (isPostPaymentFlow || isCheckoutFlow) && !isAdminPortal;

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-6">
          <button 
            onClick={() => {
              setShowForgotPassword(false);
              setResetEmailSent(false);
              forgotPasswordForm.reset();
            }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img 
                src={logoImage} 
                alt="LeadSquad" 
                className="h-10 mx-auto mb-6"
              />
              
              {resetEmailSent ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Check Your Email
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    We've sent a password reset link to your email address. Click the link to set a new password.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    Forgot Password
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your email and we'll send you a reset link
                  </p>
                </>
              )}
            </div>

            {!resetEmailSent && (
              <div className="bg-card border border-border rounded-xl p-6">
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
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

                    <Button 
                      type="submit" 
                      className="w-full mt-2" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {resetEmailSent && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    forgotPasswordForm.reset();
                  }}
                  className="mt-4"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            {/* Show success checkmark for post-payment flow */}
            {isPostPaymentFlow && (
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            )}
            
            {!isPostPaymentFlow && (
              <img 
                src={logoImage} 
                alt="LeadSquad" 
                className="h-10 mx-auto mb-6"
              />
            )}
            
            <h1 className="text-2xl font-bold text-foreground">
              {getHeaderText()}
            </h1>
            <p className="text-muted-foreground mt-2">
              {getSubheaderText()}
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        {!isSignUp && !isAdminPortal && (
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>
            </Form>

            {/* Toggle between sign in and sign up */}
            {showToggle && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
