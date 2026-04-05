'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { authService } from '@/services/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [isResending, setIsResending] = useState(false);
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('loading');
    try {
      await authService.verifyEmail(verificationToken);
      setStatus('success');
      toast.success('Email vérifié avec succès !');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Erreur lors de la vérification');
    }
  };

  const resendEmail = async () => {
    if (!email) {
      toast.error('Adresse email manquante');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email);
      toast.success('Email de vérification renvoyé !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du renvoi');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vérification en cours...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Email vérifié !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre adresse email a été vérifiée avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Compte activé !</strong> Vous pouvez maintenant vous connecter et profiter de tous nos services.
              </p>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Erreur de vérification
            </h2>
            <p className="text-gray-600 mb-6">
              Le lien de vérification est invalide ou a expiré.
            </p>
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Que faire ?</strong> Demandez un nouveau lien de vérification en utilisant le bouton ci-dessous.
              </p>
            </div>
          </>
        );

      default: // pending
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vérifiez votre email
            </h2>
            <p className="text-gray-600 mb-6">
              Nous avons envoyé un email de vérification à{' '}
              <span className="font-medium text-primary">{email}</span>
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Cliquez sur le lien</strong> dans l'email pour activer votre compte.
                Vérifiez aussi vos spams.
              </p>
            </div>
          </>
        );
    }
  };

  const renderActions = () => {
    switch (status) {
      case 'success':
        return (
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-all duration-200"
          >
            Se connecter maintenant
          </Link>
        );

      case 'error':
      case 'pending':
        return (
          <div className="space-y-4">
            {email && (
              <button
                onClick={resendEmail}
                disabled={isResending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isResending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Renvoyer l'email de vérification
              </button>
            )}
            
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Retour à la connexion
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-heading font-bold text-gradient">
              Althea Systems
            </span>
          </Link>
          {renderContent()}
        </div>

        {renderActions()}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}