import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>('q1');

  const faqs: FaqItem[] = [
    {
      id: 'q1',
      question: 'How do I place an order?',
      answer: "Simply click the 'Order on WhatsApp' button, fill out the booking form, and send your requirements. I'll reply as soon as possible."
    },
    {
      id: 'q2',
      question: 'What information do I need to provide?',
      answer: 'Please send your video title, channel name, niche, thumbnail text, face photo (if needed), logo (optional), and any reference images.'
    },
    {
      id: 'q3',
      question: 'What is the delivery time?',
      answer: 'Normal orders are delivered within 24 hours. Emergency delivery is also available for urgent projects.'
    },
    {
      id: 'q4',
      question: 'What are your working hours?',
      answer: 'You can place an order anytime. I usually work from 4:00 PM to 10:00 PM (IST).'
    },
    {
      id: 'q5',
      question: 'What payment methods do you accept?',
      answer: 'I accept UPI and other commonly used online payment methods. Payment details will be shared on WhatsApp.'
    },
    {
      id: 'q6',
      question: 'Can I request changes after delivery?',
      answer: "Yes. One free revision is included to make sure you're satisfied with the final thumbnail."
    },
    {
      id: 'q7',
      question: 'What types of thumbnails do you design?',
      answer: 'I create custom thumbnails for Gaming, Tech, Vlogs, Education, Finance, Entertainment, and many other YouTube niches.'
    },
    {
      id: 'q8',
      question: 'Do I need to send my face photo?',
      answer: 'If you want your face in the thumbnail, yes. Otherwise, I can design the thumbnail using your provided assets or preferred style.'
    },
    {
      id: 'q9',
      question: 'Are your thumbnails custom-made?',
      answer: 'Yes. Every thumbnail is designed according to your video and requirements. I do not reuse completed client designs.'
    },
    {
      id: 'q10',
      question: 'How can I contact you?',
      answer: 'The fastest way is through the WhatsApp button available on this website.'
    }
  ];

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="relative py-24 bg-zinc-950/70 border-t border-white/5 scroll-mt-20 overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 -z-10 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4 font-mono tracking-wider uppercase">
            <HelpCircle className="h-3 w-3" /> Got Questions?
          </div>
          <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about the thumbnail creation process, timings, and custom support.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`group rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-cyan-500/30 bg-gradient-to-b from-white/[0.04] to-transparent shadow-lg shadow-cyan-500/[0.02]'
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-semibold text-cyan-500/70 mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400 rotate-180'
                        : 'bg-white/5 border-white/5 text-white/40 group-hover:text-white'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 pt-1 pl-14 text-sm leading-relaxed text-zinc-400 border-t border-white/5 bg-zinc-950/20">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
