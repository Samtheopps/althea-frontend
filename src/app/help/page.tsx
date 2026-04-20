'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, Phone, Mail, MessageCircle,
  FileText, Download, Settings, Package, Truck, Shield,
  HelpCircle, BookOpen, Users,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Section, SectionHeader } from '@/components/ui/Cards';
import { useI18n } from '@/lib/i18n';

const SUPPORT_ICONS = [Phone, Mail, MessageCircle];
const CATEGORY_ICONS = [Package, Truck, Settings, Shield, Users];
const GUIDE_ICONS = [BookOpen, Settings, FileText];

export default function HelpPage() {
  const { tr } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('commandes');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = tr.help.faqCategories.map((cat, i) => ({
    ...cat,
    icon: CATEGORY_ICONS[i],
  }));

  const guides = tr.help.guides.map((g, i) => ({
    ...g,
    icon: GUIDE_ICONS[i],
  }));

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  return (
    <>
      <PageHeader
        subtitle={tr.help.subtitle}
        title={tr.help.title}
        description={tr.help.description}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: tr.help.breadcrumb }]} />

          {/* Search */}
          <Section>
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder={tr.help.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
                />
              </div>
            </motion.div>
          </Section>

          {/* Support options */}
          <Section className="bg-gray-50">
            <SectionHeader
              title={tr.help.supportTitle}
              subtitle={tr.help.supportSubtitle}
              description={tr.help.supportDesc}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tr.help.support.map((option, index) => {
                const Icon = SUPPORT_ICONS[index];
                return (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-black mb-4">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-black">{option.contact}</p>
                      <p className="text-gray-500">{option.availability}</p>
                      <p className="text-primary font-medium">{tr.help.responsePrefix} {option.responseTime}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>

          {/* FAQ */}
          <Section>
            <SectionHeader
              title={tr.help.faqTitle}
              subtitle={tr.help.faqSubtitle}
              description={tr.help.faqDesc}
            />

            <div className="space-y-6">
              {(searchQuery ? filteredFaqs : faqCategories).map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.id ? null : category.id
                    )}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <category.icon className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-black">{category.title}</h3>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                    </div>
                    {expandedCategory === category.id
                      ? <ChevronUp className="h-5 w-5 text-gray-400" />
                      : <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </button>

                  <AnimatePresence>
                    {expandedCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                      >
                        <div className="px-8 py-6 space-y-4">
                          {category.faqs.map((faq, faqIndex) => (
                            <div key={faqIndex} className="border-l-2 border-gray-200 pl-6">
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === faqIndex ? null : faqIndex)}
                                className="w-full text-left flex items-center justify-between py-3 hover:text-primary transition-colors duration-200"
                              >
                                <h4 className="font-medium text-black pr-4">{faq.question}</h4>
                                {expandedFaq === faqIndex
                                  ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                }
                              </button>
                              <AnimatePresence>
                                {expandedFaq === faqIndex && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-gray-600 pb-4 leading-relaxed">{faq.answer}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Guides */}
          <Section className="bg-gray-50">
            <SectionHeader
              title={tr.help.guidesTitle}
              subtitle={tr.help.guidesSubtitle}
              description={tr.help.guidesDesc}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 rounded-lg p-3 mr-4">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm text-gray-500">{guide.pages}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-black mb-3">{guide.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{guide.description}</p>
                  <motion.button
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>{tr.help.downloadGuide}</span>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <Section>
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">{tr.help.ctaTitle}</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">{tr.help.ctaDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tr.help.contactSupport}
                </motion.button>
                <motion.button
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tr.help.scheduleCall}
                </motion.button>
              </div>
            </motion.div>
          </Section>
        </div>
      </div>
    </>
  );
}
