'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Save,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Loader2,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import accountService, { getAccountErrorMessage } from '@/services/accountService';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

interface EmailForm {
  email: string;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { tr } = useI18n();

  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  });

  const emailForm = useForm<EmailForm>({
    defaultValues: { email: user?.email ?? '' },
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
    });
    emailForm.reset({ email: user.email ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  if (!user) return null;

  const inputCls =
    'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  const saveProfile = async (data: ProfileForm) => {
    try {
      setSavingProfile(true);
      const updated = await accountService.updateMe({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim() || undefined,
      });
      // Rafraîchir auth store
      setUser({ ...user, ...updated });
      toast.success(tr.account.profileUpdated);
      setSavedSection('profile');
      setTimeout(() => setSavedSection(null), 3000);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de mettre à jour le profil.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async (data: EmailForm) => {
    const email = data.email.trim();
    if (!email || email === user.email) {
      toast.error('Veuillez saisir une nouvelle adresse email.'); //TODO i18n
      return;
    }
    try {
      setSavingEmail(true);
      await accountService.updateEmail({ email });
      toast.success('Un email de vérification a été envoyé.'); //TODO i18n
      setSavedSection('email');
      setTimeout(() => setSavedSection(null), 3000);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, "Impossible d'envoyer l'email de vérification."));
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/account"
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-800">
              {tr.account.settingsTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{tr.account.settingsSubtitle}</p>
          </div>
        </div>

        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <User className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{tr.account.personalInfo}</h2>
              <p className="text-xs text-slate-500">{tr.account.personalInfoSubtitle}</p>
            </div>
            {savedSection === 'profile' && (
              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> {tr.account.savedLabel}
              </div>
            )}
          </div>

          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {tr.auth.firstName}
                </label>
                <input
                  {...profileForm.register('firstName', { required: true })}
                  className={inputCls}
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {tr.auth.lastName}
                </label>
                <input
                  {...profileForm.register('lastName', { required: true })}
                  className={inputCls}
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {tr.account.phone}
                </span>
              </label>
              <input
                {...profileForm.register('phone')}
                type="tel"
                className={inputCls}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary gap-2 disabled:opacity-60"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {tr.account.saveChanges}
            </button>
          </form>
        </motion.div>

        {/* Email change section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <Mail className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                {/* //TODO i18n */}Changer mon email
              </h2>
              <p className="text-xs text-slate-500">{tr.account.emailChangeNote}</p>
            </div>
            {savedSection === 'email' && (
              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> {tr.account.savedLabel}
              </div>
            )}
          </div>

          <form onSubmit={emailForm.handleSubmit(saveEmail)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {tr.auth.email}
              </label>
              <input
                {...emailForm.register('email', { required: true })}
                type="email"
                className={inputCls}
                placeholder="nouveau@email.com"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {/* //TODO i18n */}
                Un email de confirmation sera envoyé à la nouvelle adresse. Le
                changement ne sera effectif qu&apos;après vérification.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingEmail}
              className="btn btn-primary gap-2 disabled:opacity-60"
            >
              {savingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {/* //TODO i18n */}Envoyer l&apos;email de vérification
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
