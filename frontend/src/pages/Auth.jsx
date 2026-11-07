import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Auth = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Create demo account if it doesn't exist
  React.useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const demoExists = users.find(u => u.email === 'demo@helmhr.com');
    
    if (!demoExists) {
      const demoUser = {
        id: 1,
        name: 'Demo User',
        email: 'demo@helmhr.com',
        password: 'demo123',
        createdAt: new Date().toISOString(),
      };
      users.push(demoUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (isSignUp && !formData.name) {
      setError('Name is required for sign up');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp) {
      // Sign up - create new user
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === formData.email);
      if (existingUser) {
        setError('User with this email already exists');
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto login after signup
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Sign in - check credentials
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(
        u => u.email === formData.email && u.password === formData.password
      );

      if (!user) {
        setError('Invalid email or password');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Helm HR Ops</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    data-testid="auth-name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  data-testid="auth-email-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" data-testid="auth-submit-button">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-primary hover:underline"
              data-testid="toggle-auth-mode"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 p-3 rounded-md bg-accent/50 border border-border">
              <p className="text-xs font-semibold mb-2 text-foreground">Demo Credentials:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <code className="text-xs bg-background px-2 py-0.5 rounded border border-border">demo@helmhr.com</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Password:</span>
                  <code className="text-xs bg-background px-2 py-0.5 rounded border border-border">demo123</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Or sign up with any email (min 6 char password)
              </p>
            </div>
          )}
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Manager-facing HR operations dashboard</p>
          <p className="mt-1">© 2025 Helm HR Ops. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
