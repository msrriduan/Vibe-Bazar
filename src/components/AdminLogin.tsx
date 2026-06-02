import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, Send, LogIn } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface AdminLoginProps {
  onClose: () => void;
}

export default function AdminLogin({ onClose }: AdminLoginProps) {
  const { setIsAdmin, login } = useShop();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await login();
    } catch (e: any) {
      console.error("Google login failed", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (errorMessage.includes('popup-closed-by-user') || errorMessage.includes('cancelled-by-user')) {
        setError("Note: The Google Auth popup was blocked or closed (often due to iframe sandbox limits in the preview). Please open this app in a new tab using the 'Open in New Tab' icon at the top right to log in with Google, or simply enter the Secure Password keys below to get instant access.");
      } else {
        setError("Google Auth popup failed. Please use standard password entry keys below or open the app in a new tab.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Minor delay to feel premium/secure
    setTimeout(() => {
      const sanitizedIdentifier = identifier.trim().toLowerCase();
      const sanitizedPassword = password;

      const isValidEmail = sanitizedIdentifier === 'msrriduan@gmail.com';
      const isValidPhone = sanitizedIdentifier === '01989475141';
      const isValidPassword = sanitizedPassword === 'Msrriduan10#';

      if ((isValidEmail || isValidPhone) && isValidPassword) {
        setIsAdmin(true);
      } else {
        setError('Invalid admin email/phone number or incorrect security password.');
        setIsSubmitting(false);
      }
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-1 px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900 shadow-2xl p-8 sm:p-10 border border-zinc-200/60 dark:border-zinc-800 text-left"
      >
        {/* Glow Effects */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-orange/10 dark:bg-brand-orange/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-brand-pink/10 dark:bg-brand-pink/5 blur-2xl pointer-events-none" />

        {/* Back Link */}
        <button
          type="button"
          onClick={onClose}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-brand-pink transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Storefront</span>
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 space-y-3">
          <div className="p-3 bg-gradient-to-br from-brand-orange/5 to-brand-pink/5 rounded-2xl border border-brand-pink/10 shadow-xs">
            <BrandLogo size="md" showText={false} />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
              ADMIN SECURE GATEWAY
            </h2>
            <p className="text-[11px] text-zinc-400 font-semibold font-sans mt-1">
              Select Google Authenticator or sign in with your secure access credentials.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 flex gap-3 text-rose-650 dark:text-rose-400 text-xs font-medium"
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <p className="leading-relaxed whitespace-pre-line">{error}</p>
          </motion.div>
        )}

        {/* Google Authentication Section */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isSubmitting}
            className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-pink/50 dark:hover:border-brand-orange/50 text-zinc-700 dark:text-zinc-205 font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950/50"
          >
            {googleLoading ? (
              <div className="h-4 w-4 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Log In with Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
              or use secure credentials
            </span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Phone field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Admin Email or Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-brand-pink transition-colors">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                required
                placeholder="msrriduan@gmail.com or 01989475141"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isSubmitting || googleLoading}
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold rounded-xl pl-12 pr-4 py-3.5 focus:border-brand-pink dark:focus:border-brand-pink focus:outline-hidden transition-all text-zinc-900 dark:text-white shadow-xs"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Security Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-brand-pink transition-colors">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || googleLoading}
                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold rounded-xl pl-12 pr-12 py-3.5 focus:border-brand-pink dark:focus:border-brand-pink focus:outline-hidden transition-all text-zinc-900 dark:text-white shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || googleLoading}
                className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || googleLoading}
            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white font-display text-xs font-black uppercase tracking-wider py-4 shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Log In</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
