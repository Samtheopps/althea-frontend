'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  const { tr } = useI18n();
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = tr.auth.pwdStrengthLabels;
    if (score <= 1) return { score, label: labels[0], color: '#ef4444' };
    if (score === 2) return { score, label: labels[1], color: '#f59e0b' };
    if (score === 3) return { score, label: labels[2], color: '#f59e0b' };
    if (score === 4) return { score, label: labels[3], color: '#10b981' };
    return { score, label: labels[4], color: '#10b981' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success(tr.auth.accountCreated);
      router.push('/auth/verify-email?email=' + encodeURIComponent(data.email));
    } catch (error: any) {
      toast.error(error.message || tr.auth.accountCreateError);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification de la visibilité du bouton
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full space-y-5"
      >
        {/* Header minimaliste */}
        <div className="text-center space-y-4">
          <Logo href="/" size="md" />
          
          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-semibold text-black">
              {tr.auth.registerTitle}
            </h2>
            <p className="text-sm text-black">
              {tr.auth.registerSubtitle}
            </p>
          </div>
        </div>

        {/* Formulaire épuré - VISIBILITÉ AMÉLIORÉE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">{/* Plus d'espacement */}
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-black block">
                  {tr.auth.firstName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="h-4 w-4 text-black" />
                  </div>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    autoComplete="given-name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
                    placeholder={tr.auth.firstName}
                  />
                </div>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1"
                  >
                    {errors.firstName.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-black block">
                  {tr.auth.lastName}
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  autoComplete="family-name"
                  className="w-full px-4 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
                  placeholder={tr.auth.lastName}
                />
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1"
                  >
                    {errors.lastName.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
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

            {/* Mot de passe */}
            <div className="space-y-1.5">
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
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
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
              {/* Indicateur de force */}
              {passwordValue.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength.score ? strength.color : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
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

            {/* Confirmer mot de passe */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-black block">
                {tr.auth.confirmPassword}
              </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="h-4 w-4 text-black" />
                 </div>
                 <input
                   {...register('confirmPassword')}
                   type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                 <button
                   type="button"
                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-black transition-colors duration-200"
                 >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start gap-3 pt-2 pb-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-[#00a8b5] focus:ring-[#00a8b5]/20 focus:ring-2 mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-black leading-relaxed">
                {tr.auth.termsPrefix}{' '}
                <Link href="/legal/cgu" className="text-[#00a8b5] hover:text-[#33bfc9] font-medium transition-colors underline">
                  {tr.auth.termsLinkLabel}
                </Link>{' '}
                {tr.auth.termsAnd}{' '}
                <Link href="/legal/privacy" className="text-[#00a8b5] hover:text-[#33bfc9] font-medium transition-colors underline">
                  {tr.auth.privacyLinkLabel}
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#00a8b5] hover:bg-[#33bfc9] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ 
                minHeight: '48px'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span className="font-semibold">{tr.auth.creatingAccount}</span>
                </div>
              ) : (
                <span className="font-semibold">{tr.nav.createAccount}</span>
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
            {tr.auth.hasAccount}{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary-hover font-semibold transition-colors duration-200"
            >
              {tr.nav.login}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}