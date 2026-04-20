'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { authService } from '@/services/auth';
import { useI18n } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';

export default function ForgotPasswordPage() {
  const { tr } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success(tr.auth.recoveryEmailSent);
    } catch (error: any) {
      toast.error(error.message || tr.auth.recoveryEmailError);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">
              {tr.auth.emailSentTitle}
            </h2>
            <p className="text-black mb-6">
              {tr.auth.emailSentDesc}{' '}
              <span className="font-medium text-primary">{getValues('email')}</span>
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-black">
                {tr.auth.emailSentNote}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tr.auth.backToLogin}
            </Link>

            <button
              onClick={() => setEmailSent(false)}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-50 transition-all duration-200"
            >
              {tr.auth.resendEmail}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg"
      >
        {/* Header */}
        <div className="text-center">
          <Logo href="/" size="md" className="mb-6" />
          <h2 className="text-3xl font-bold text-black mb-4">
            {tr.auth.forgotTitle}
          </h2>
          <p className="text-black">
            {tr.auth.forgotDesc}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">
              {tr.auth.email}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-black" />
              </div>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder={tr.auth.emailPlaceholder}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {tr.auth.sendRecoveryLink}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {tr.auth.backToLogin}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
