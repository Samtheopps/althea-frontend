'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd,     setShowNewPwd]     = useState(false);
  const [savedSection,   setSavedSection]   = useState<string | null>(null);

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      email:     user?.email     ?? '',
    },
  });

  const pwdForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const saveProfile = async (_data: any) => {
    await new Promise(r => setTimeout(r, 600));
    toast.success(tr.account.profileUpdated);
    setSavedSection('profile');
    setTimeout(() => setSavedSection(null), 3000);
  };

  const savePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(tr.account.pwdMismatch);
      return;
    }
    await new Promise(r => setTimeout(r, 600));
    toast.success(tr.account.pwdUpdated);
    pwdForm.reset();
    setSavedSection('password');
    setTimeout(() => setSavedSection(null), 3000);
  };

  if (!user) {
    router.replace('/login');
    return null;
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-800">{tr.account.settingsTitle}</h1>
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e0f7f9' }}>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.auth.firstName}</label>
                <input {...profileForm.register('firstName')} className={inputCls} placeholder="Jean" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.auth.lastName}</label>
                <input {...profileForm.register('lastName')} className={inputCls} placeholder="Dupont" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{tr.auth.email}</span>
              </label>
              <input {...profileForm.register('email')} type="email" className={inputCls} />
              <p className="text-xs text-slate-400 mt-1">{tr.account.emailChangeNote}</p>
            </div>
            <button type="submit" className="btn btn-primary gap-2">
              <Save className="w-4 h-4" />
              {tr.account.saveChanges}
            </button>
          </form>
        </motion.div>

        {/* Password section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e0f7f9' }}>
              <Lock className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{tr.account.pwdTitle}</h2>
              <p className="text-xs text-slate-500">{tr.account.pwdSubtitle}</p>
            </div>
            {savedSection === 'password' && (
              <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> {tr.account.pwdChanged}
              </div>
            )}
          </div>

          <form onSubmit={pwdForm.handleSubmit(savePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.currentPassword}</label>
              <div className="relative">
                <input
                  {...pwdForm.register('currentPassword')}
                  type={showCurrentPwd ? 'text' : 'password'}
                  className={`${inputCls} pr-10`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.newPasswordLabel}</label>
              <div className="relative">
                <input
                  {...pwdForm.register('newPassword')}
                  type={showNewPwd ? 'text' : 'password'}
                  className={`${inputCls} pr-10`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowNewPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.confirmNewPassword}</label>
              <input {...pwdForm.register('confirmPassword')} type="password" className={inputCls} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary gap-2">
              <Lock className="w-4 h-4" />
              {tr.account.changePasswordBtn}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
