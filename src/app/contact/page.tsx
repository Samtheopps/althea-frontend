'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import dynamic from 'next/dynamic';
import { contactSchema, type ContactInput } from '@/lib/validations';
import { useI18n } from '@/lib/i18n';

const ContactMap = dynamic(() => import('@/components/contact/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
      <MapPin className="h-8 w-8 text-gray-400" />
    </div>
  ),
});

export default function ContactPage() {
  const { tr } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contact form data:', data);
      setIsSubmitted(true);
      toast.success(tr.contact.successToast);
      reset();
    } catch {
      toast.error(tr.contact.errorToast);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: tr.contact.phoneTitle,
      content: '+33 1 23 45 67 89',
      description: tr.contact.phoneHours,
    },
    {
      icon: Mail,
      title: tr.contact.emailTitle,
      content: 'contact@althea-systems.fr',
      description: tr.contact.emailResponse,
    },
    {
      icon: MapPin,
      title: tr.contact.addressTitle,
      content: '123 Avenue de la Santé',
      description: tr.contact.addressCity,
    },
    {
      icon: Clock,
      title: tr.contact.hoursTitle,
      content: tr.contact.hoursContent,
      description: tr.contact.hoursDesc,
    },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">
              {tr.contact.successTitle}
            </h2>
            <p className="text-black mb-8 max-w-md mx-auto">
              {tr.contact.successDesc}
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center px-6 h-12 border border-transparent text-base font-medium rounded-lg text-white bg-[#00a8b5] hover:bg-[#33bfc9] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {tr.contact.sendAnother}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4">
              {tr.contact.title}
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto">
              {tr.contact.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Contact info */}
          <div className="lg:col-span-5 mb-12 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-black mb-6">
                {tr.contact.coordinates}
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#e0f7f9] rounded-full flex items-center justify-center shadow-sm">
                          <Icon className="h-5 w-5 text-[#00a8b5]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-black">
                          {info.title}
                        </h3>
                        <p className="text-black font-medium">
                          {info.content}
                        </p>
                        <p className="text-black">
                          {info.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Interactive map */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <ContactMap />
              </motion.div>
            </motion.div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-black mb-6">
                {tr.contact.sendUsMessage}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* First + Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {tr.auth.firstName} *
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {tr.auth.lastName} *
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {tr.auth.email} *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="votre.email@exemple.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {tr.account.phone}
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {tr.checkout.company}
                    </label>
                    <input
                      {...register('company')}
                      type="text"
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {tr.contact.subject} *
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {tr.contact.message} *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary resize-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* RGPD */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="rgpd"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="rgpd" className="text-black">
                        {tr.contact.rgpdText}{' '}
                        <a href="/legal/privacy" className="text-primary hover:underline">
                          {tr.contact.rgpdLink}
                        </a>{' '}
                        {tr.contact.rgpdSuffix}
                      </label>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-6 h-12 border border-transparent text-base font-medium rounded-lg text-white bg-[#00a8b5] hover:bg-[#33bfc9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a8b5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? tr.common.loading : tr.contact.send}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* FAQ section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white border border-gray-200 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            {tr.contact.faqTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tr.contact.faqItems.map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium text-black mb-2">
                  {item.q}
                </h3>
                <p className="text-black text-sm">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
