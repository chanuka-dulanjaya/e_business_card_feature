import { useState, useEffect, useCallback } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Building2, Users, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
type UserType = 'individual' | 'team' | 'organization';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LoginProps {
  initialMode?: 'login' | 'register';
  onNavigateHome?: () => void;
}

export default function Login({ initialMode = 'login', onNavigateHome }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<UserType>('individual');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp({ email, password, fullName, userType });
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(response.message || 'If an account with that email exists, a password reset link has been sent.');
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setMode('reset-password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(resetToken, password);
      setSuccess(response.message || 'Password reset successfully');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setResetToken('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = useCallback(async (response: any) => {
    try {
      setLoading(true);
      setError('');

      // Decode the JWT token from Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      await signInWithGoogle({
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        profilePicture: payload.picture,
        userType: userType // Use the selected user type for new signups
      });
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, userType]);

  // Load Google Identity Services
  useEffect(() => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Google Sign-In button when loaded and mode changes
  useEffect(() => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (!googleLoaded || !window.google?.accounts || !googleClientId) {
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        window.google!.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
          auto_select: false,
        });

        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          buttonContainer.innerHTML = ''; // Clear previous button
          window.google!.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
          });
        }
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [googleLoaded, mode, handleGoogleCallback]);

  const userTypeOptions = [
    {
      type: 'individual' as UserType,
      icon: User,
      title: 'Individual',
      description: 'Create one personal business card'
    },
    {
      type: 'team' as UserType,
      icon: Users,
      title: 'Team',
      description: 'Create teams and manage members'
    },
    {
      type: 'organization' as UserType,
      icon: Building2,
      title: 'Organization',
      description: 'Create organizations with multiple teams'
    }
  ];

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setMode('forgot-password')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or continue with</span>
        </div>
      </div>

      <div id="google-signin-button" className="flex justify-center"></div>

      <p className="text-center text-slate-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => { setMode('register'); setError(''); }}
          className="text-slate-900 font-medium hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="registerEmail" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="registerEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="registerPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="registerPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="At least 6 characters"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Account Type
        </label>
        <div className="grid grid-cols-1 gap-3">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => setUserType(option.type)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  userType === option.type
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  userType === option.type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{option.title}</p>
                  <p className="text-sm text-slate-500">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or sign up with</span>
        </div>
      </div>

      <div id="google-signin-button" className="flex justify-center"></div>

      <p className="text-center text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className="text-slate-900 font-medium hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <div>
        <label htmlFor="forgotEmail" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="forgotEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <button
        type="button"
        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
        className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label htmlFor="resetToken" className="block text-sm font-medium text-slate-700 mb-2">
          Reset Token
        </label>
        <input
          id="resetToken"
          type="text"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          placeholder="Paste your reset token"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="newPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="At least 6 characters"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            placeholder="Confirm your new password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>

      <button
        type="button"
        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
        className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'Set New Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to access your business cards';
      case 'register':
        return 'Get started with your digital business card';
      case 'forgot-password':
        return 'Enter your email to receive a reset link';
      case 'reset-password':
        return 'Enter your new password below';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'login':
        return LogIn;
      case 'register':
        return UserPlus;
      default:
        return Mail;
    }
  };

  const Icon = getIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        )}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-slate-900 p-3 rounded-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            {getTitle()}
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {getSubtitle()}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
              {success}
            </div>
          )}

          {mode === 'login' && renderLoginForm()}
          {mode === 'register' && renderRegisterForm()}
          {mode === 'forgot-password' && renderForgotPasswordForm()}
          {mode === 'reset-password' && renderResetPasswordForm()}
        </div>
      </div>
    </div>
  );
}
