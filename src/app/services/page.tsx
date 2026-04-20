'use client';

import { motion } from 'framer-motion';
import {
  Wrench, GraduationCap, Headphones, Settings, Truck,
  FileCheck, Clock, Users, Phone, Mail, Calendar,
  CheckCircle, Star,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Section, SectionHeader } from '@/components/ui/Cards';
import { ProcessStepCard, ServiceCard, StatsGrid, CallToActionCard } from '@/components/ui/EnhancedCards';
import { useI18n } from '@/lib/i18n';

const MAIN_SERVICE_ICONS = [Truck, Wrench, GraduationCap, Headphones];
const STAT_ICONS         = [Clock, Users, Settings, FileCheck];
const STAT_VALUES        = ['< 24h', '98%', '25+', '5000+'];
const STAT_COLORS        = ['primary', 'success', 'secondary', 'warning'] as const;
const SUPPORT_ICONS      = [Phone, Settings, Calendar, Mail];
const COMMIT_ICONS       = [CheckCircle, Clock, Star];
const COMMIT_STYLES      = [
  { bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200', icon: 'bg-emerald-500', text: 'text-emerald-700' },
  { bg: 'from-blue-50 to-blue-100/50',       border: 'border-blue-200',    icon: 'bg-blue-500',    text: 'text-blue-700' },
  { bg: 'from-purple-50 to-purple-100/50',   border: 'border-purple-200',  icon: 'bg-purple-500',  text: 'text-purple-700' },
];

const STEP_NUMBERS = ['01', '02', '03', '04', '05'];

export default function ServicesPage() {
  const { tr } = useI18n();

  const mainServices = tr.services.mainServices.map((s, i) => ({
    ...s,
    features: [...s.features],
    icon: MAIN_SERVICE_ICONS[i],
  }));

  const serviceStats = tr.services.serviceStats.map((s, i) => ({
    ...s,
    icon: STAT_ICONS[i],
    value: STAT_VALUES[i],
    color: STAT_COLORS[i],
  }));

  const installationProcess = tr.services.installProcess.map((s, i) => ({
    ...s,
    step: STEP_NUMBERS[i],
  }));

  const supportOptions = tr.services.supportOptions.map((s, i) => ({
    ...s,
    features: [...s.features],
    icon: SUPPORT_ICONS[i],
  }));

  const commitments = [
    { title: tr.services.commit1Title, desc: tr.services.commit1Desc, items: tr.services.commit1Items },
    { title: tr.services.commit2Title, desc: tr.services.commit2Desc, items: tr.services.commit2Items },
    { title: tr.services.commit3Title, desc: tr.services.commit3Desc, items: tr.services.commit3Items },
  ];

  return (
    <>
      <PageHeader
        subtitle={tr.services.subtitle}
        title={tr.services.title}
        description={tr.services.description}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: tr.services.breadcrumb }]} />

          {/* Main services */}
          <Section variant="modern">
            <SectionHeader
              title={tr.services.mainTitle}
              subtitle={tr.services.mainSubtitle}
              description={tr.services.mainDesc}
              variant="modern"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {mainServices.map((service, index) => (
                <ServiceCard
                  key={index}
                  {...service}
                  index={index}
                  variant={index === 1 ? 'featured' : 'default'}
                />
              ))}
            </div>
          </Section>

          {/* Stats */}
          <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
            <SectionHeader
              title={tr.services.statsTitle}
              subtitle={tr.services.statsSubtitle}
              description={tr.services.statsDesc}
              variant="modern"
            />
            <StatsGrid stats={serviceStats} />
          </Section>

          {/* Installation process */}
          <Section variant="premium">
            <SectionHeader
              title={tr.services.installTitle}
              subtitle={tr.services.installSubtitle}
              description={tr.services.installDesc}
              variant="modern"
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {installationProcess.map((step, index) => (
                <ProcessStepCard
                  key={index}
                  {...step}
                  index={index}
                  isLast={index === installationProcess.length - 1}
                />
              ))}
            </div>
          </Section>

          {/* Support options */}
          <Section className="bg-gradient-to-br from-gray-50 via-white to-gray-50" variant="modern">
            <SectionHeader
              title={tr.services.supportTitle}
              subtitle={tr.services.supportSubtitle}
              description={tr.services.supportDesc}
              variant="modern"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {supportOptions.map((option, index) => (
                <ServiceCard
                  key={index}
                  {...option}
                  index={index}
                  variant="default"
                />
              ))}
            </div>
          </Section>

          {/* Commitments */}
          <Section variant="premium">
            <SectionHeader
              title={tr.services.commitTitle}
              subtitle={tr.services.commitSubtitle}
              description={tr.services.commitDesc}
              variant="modern"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {commitments.map(({ title, desc, items }, i) => {
                const s    = COMMIT_STYLES[i];
                const Icon = COMMIT_ICONS[i];
                return (
                  <motion.div
                    key={i}
                    className={`bg-gradient-to-br ${s.bg} rounded-3xl p-8 border ${s.border} shadow-xl`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 ${s.icon} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">{title}</h3>
                      <p className="text-gray-600 mb-4">{desc}</p>
                      <div className={`text-sm ${s.text} font-medium`}>
                        {items.map((item, j) => (
                          <span key={j}>✓ {item}<br /></span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>

          {/* CTA */}
          <Section>
            <CallToActionCard
              title={tr.services.ctaTitle}
              description={tr.services.ctaDesc}
              primaryButton={{ text: tr.services.ctaBtn, href: '/contact' }}
              secondaryButton={{ text: tr.services.ctaCall, href: 'tel:+33123456789' }}
              variant="gradient"
            />
          </Section>
        </div>
      </div>
    </>
  );
}
