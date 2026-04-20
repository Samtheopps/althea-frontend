'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/authStore';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { tr } = useI18n();
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<{ type: 'invalid' | 'unconfirmed' | 'generic'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie !');
      router.push('/account');
    } catch (error: any) {
      const msg: string = error.message || '';
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verif') || msg.toLowerCase().includes('email')) {
        setLoginError({ type: 'unconfirmed', message: msg });
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('mot de passe')) {
        setLoginError({ type: 'invalid', message: msg });
      } else {
        setLoginError({ type: 'generic', message: msg || 'Erreur de connexion' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header minimaliste */}
        <div className="text-center space-y-6">
          <div className="inline-block group">
            <Logo 
              size="lg" 
              className="transition-transform duration-300 group-hover:scale-105" 
              href="/" 
            />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-semibold text-black">
              {tr.auth.loginTitle}
            </h2>
            <p className="text-sm text-black">
              Accédez à votre espace professionnel
            </p>
          </div>
        </div>

        {/* Formulaire épuré */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-black block">
                {tr.auth.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Mail className="h-4 w-4 text-black" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-black block">
                {tr.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="h-4 w-4 text-black" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-black transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 text-black">
                  {tr.auth.rememberMe}
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:text-primary-hover font-medium transition-colors duration-200"
              >
                {tr.auth.forgotPassword}
              </Link>
            </div>

            {/* Messages d'erreur contextuels */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-3.5 rounded-lg text-sm ${
                  loginError.type === 'unconfirmed'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {loginError.type === 'unconfirmed' ? (
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800">Email non confirmé</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Vérifiez votre boîte mail et cliquez sur le lien de confirmation avant de vous connecter.
                    </p>
                    <Link href="/auth/verify-email" className="text-xs font-semibold text-amber-800 underline mt-1 inline-block">
                      Renvoyer l'email de confirmation →
                    </Link>
                  </div>
                ) : (
                  <p className="text-red-700 flex-1">
                    {loginError.type === 'invalid'
                      ? 'Email ou mot de passe incorrect. Vérifiez vos identifiants.'
                      : loginError.message}
                  </p>
                )}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 px-6 bg-[#00a8b5] hover:bg-[#33bfc9] text-white text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                tr.nav.login
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-sm text-black">
            {tr.auth.noAccount}{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary-hover font-semibold transition-colors duration-200"
            >
              {tr.nav.createAccount}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}