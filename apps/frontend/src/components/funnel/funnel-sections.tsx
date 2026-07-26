'use client';

import type { ReactNode } from 'react';
import { CheckCircle, ClipboardCheck, FileText, HeartPulse, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type FunnelSectionType = 'hero' | 'three_cards' | 'qualification' | 'signup' | 'footer';

export interface FunnelSection {
  id: string;
  type: FunnelSectionType;
  props: Record<string, any>;
}

interface FunnelSectionTemplate {
  type: FunnelSectionType;
  name: string;
  category: string;
  description: string;
  defaultProps: Record<string, any>;
}

export const funnelSectionTemplates: FunnelSectionTemplate[] = [
  {
    type: 'hero',
    name: 'Hero',
    category: 'Opening',
    description: 'First screen with headline, supporting copy, and primary call to action.',
    defaultProps: {
      eyebrow: 'Altira Orbit',
      headline: 'A calmer way to manage medical cover',
      subheadline: 'Build trust quickly with a focused message, clear next step, and a professional first impression.',
      ctaText: 'Start application',
    },
  },
  {
    type: 'three_cards',
    name: '3 Card Benefits',
    category: 'Trust',
    description: 'Three concise benefit cards for value, speed, and support.',
    defaultProps: {
      heading: 'Why members choose this route',
      cards: [
        { title: 'Clear options', body: 'Help visitors understand their choices without overwhelming them.' },
        { title: 'Fast guidance', body: 'Move interested people from curiosity to application with fewer steps.' },
        { title: 'Human support', body: 'Make the support promise visible before the visitor needs help.' },
      ],
    },
  },
  {
    type: 'qualification',
    name: 'Qualification',
    category: 'Decision',
    description: 'A qualification section that frames who the offer is for.',
    defaultProps: {
      heading: 'A good fit if you need',
      intro: 'Use this section to pre-qualify interest before the visitor reaches the form.',
      bullets: ['Member administration support', 'Provider coordination', 'Claims and compliance visibility'],
    },
  },
  {
    type: 'signup',
    name: 'Sign Up',
    category: 'Capture',
    description: 'Lead capture block that sends visitors into the existing application flow.',
    defaultProps: {
      heading: 'Ready to continue?',
      body: 'Capture the visitor while intent is still high.',
      buttonText: 'Continue to application',
      helperText: 'A team member can assist if anything is unclear.',
    },
  },
  {
    type: 'footer',
    name: 'Footer',
    category: 'Close',
    description: 'Simple branded close for contact and reassurance.',
    defaultProps: {
      heading: 'Altira Orbit',
      body: 'A secure operating workspace for healthcare administration teams.',
      contact: 'support@altiragroup.co.za',
    },
  },
];

export function createFunnelSection(type: FunnelSectionType): FunnelSection {
  const template = funnelSectionTemplates.find((item) => item.type === type) ?? funnelSectionTemplates[0];
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    type: template.type,
    props: structuredClone(template.defaultProps),
  };
}

function SectionShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`w-full px-6 py-14 md:px-10 ${className}`}>{children}</section>;
}

export function FunnelSectionPreview({ section }: { section: FunnelSection }) {
  const props = section.props ?? {};

  if (section.type === 'hero') {
    return (
      <SectionShell className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-cyan-100">
              {props.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{props.headline}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">{props.subheadline}</p>
            <Button className="mt-7 bg-cyan-400 text-slate-950 hover:bg-cyan-300">{props.ctaText}</Button>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl">
            <div className="grid gap-3">
              {['Member fit', 'Provider network', 'Claims support'].map((label) => (
                <div key={label} className="flex items-center gap-3 rounded-md bg-white/10 p-3">
                  <CheckCircle className="h-5 w-5 text-cyan-200" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.type === 'three_cards') {
    return (
      <SectionShell className="bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-950">{props.heading}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(props.cards ?? []).map((card: any, index: number) => {
              const icons = [ShieldCheck, HeartPulse, Sparkles];
              const Icon = icons[index] ?? FileText;
              return (
                <div key={`${card.title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <Icon className="h-8 w-8 text-cyan-600" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.type === 'qualification') {
    return (
      <SectionShell className="bg-cyan-50">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <ClipboardCheck className="h-10 w-10 text-cyan-700" />
            <h2 className="mt-4 text-3xl font-bold text-slate-950">{props.heading}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{props.intro}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="grid gap-3">
              {(props.bullets ?? []).map((bullet: string, index: number) => (
                <div key={`${bullet}-${index}`} className="flex items-start gap-3 rounded-md border border-slate-100 p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (section.type === 'signup') {
    return (
      <SectionShell className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <Mail className="h-10 w-10 text-cyan-300" />
            <h2 className="mt-4 text-3xl font-bold">{props.heading}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{props.body}</p>
          </div>
          <div className="rounded-lg bg-white p-5 text-slate-950">
            <div className="grid gap-3">
              <input className="h-10 rounded-md border px-3 text-sm" placeholder="Name" />
              <input className="h-10 rounded-md border px-3 text-sm" placeholder="Email" />
              <Button className="bg-cyan-600 hover:bg-cyan-700">{props.buttonText}</Button>
              <p className="text-xs text-slate-500">{props.helperText}</p>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="bg-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-slate-950">{props.heading}</p>
          <p>{props.body}</p>
        </div>
        <p className="font-medium">{props.contact}</p>
      </div>
    </SectionShell>
  );
}
