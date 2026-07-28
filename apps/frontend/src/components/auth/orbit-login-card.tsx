'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, X } from 'lucide-react';

interface OrbitLoginCardProps {
  className?: string;
  onClose?: () => void;
}

export function OrbitLoginCard({ className = '', onClose }: OrbitLoginCardProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, credential);
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (err: any) {
      const looksLikeMemberPin = /^\d{4,6}$/.test(credential.trim());

      if (!looksLikeMemberPin) {
        console.error('Login error:', err);
        setError(err.message || 'Login failed. Please check your details.');
        return;
      }

      try {
        const response = await fetch('/api/member/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, pin: credential }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Login error:', err);
          setError(data.error || err.message || 'Login failed. Please check your details.');
          return;
        }

        localStorage.setItem('member_session', data.session_token || data.member?.id || '');
        localStorage.setItem('member_data', JSON.stringify(data.member));
        window.location.href = '/member/dashboard';
      } catch (memberErr: any) {
        console.error('Login error:', memberErr);
        setError(memberErr.message || err.message || 'Login failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative w-full overflow-hidden border border-white/70 bg-[#07152d]/92 bg-none pb-0 text-white shadow-[0_20px_70px_rgba(2,6,18,0.45)] backdrop-blur-xl ${className}`}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#65fff2]/50"
          aria-label="Close sign-in"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <CardHeader className="mb-1 mt-1.5 items-center space-y-1 px-3 pb-1.5 pt-2.5 text-center">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-white">Sign in to Orbit</h2>
          <p className="text-xs text-[#dffdfa]/80">Welcome back. Enter your access details.</p>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <form onSubmit={handleLogin} className="space-y-2.5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="border-white/80 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-[#65fff2] focus-visible:ring-[#65fff2]/25"
            />
          </div>

          <div className="space-y-0">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="credential" className="text-white/90">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="credential"
                className="border-white/80 bg-white pe-9 text-slate-950 placeholder:text-slate-400 focus-visible:border-[#65fff2] focus-visible:ring-[#65fff2]/25"
                placeholder="Enter password or PIN"
                type={showPassword ? 'text' : 'password'}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-slate-500 outline-none transition-colors hover:text-slate-950 focus-visible:ring-[3px] focus-visible:ring-[#65fff2]/25"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="credential"
              >
                {showPassword ? <EyeOffIcon size={16} aria-hidden="true" /> : <EyeIcon size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 accent-[#081b66]"
            />
            <Label htmlFor="remember" className="text-sm font-normal text-white/78">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full border border-white/45 bg-white/10 text-white shadow-[0_0_28px_rgba(101,255,242,0.12)] hover:bg-white/18" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="mt-2.5 flex justify-center border-t border-white/16 bg-[#07152d]/40 !px-3 !py-1.5">
        <p className="text-center text-xs text-[#dffdfa]/72">One secure access point for staff and members.</p>
      </CardFooter>
    </Card>
  );
}
