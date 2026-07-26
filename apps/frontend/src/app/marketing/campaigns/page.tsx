'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Eye, LibraryBig, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/lib/auth-fetch';
import {
  createFunnelSection,
  FunnelSection,
  FunnelSectionPreview,
  funnelSectionTemplates,
} from '@/components/funnel/funnel-sections';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function MarketingCampaignsPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [name, setName] = useState('Altira Orbit Campaign');
  const [title, setTitle] = useState('Altira Orbit');
  const [description, setDescription] = useState('Reusable campaign funnel built in Altira Orbit.');
  const [sections, setSections] = useState<FunnelSection[]>([
    createFunnelSection('hero'),
    createFunnelSection('three_cards'),
    createFunnelSection('signup'),
    createFunnelSection('footer'),
  ]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(sections[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slug = useMemo(() => slugify(name || title || 'altira-funnel'), [name, title]);
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) return null;

  const addSection = (type: FunnelSection['type']) => {
    const nextSection = createFunnelSection(type);
    setSections((current) => [...current, nextSection]);
    setSelectedSectionId(nextSection.id);
  };

  const removeSection = (id: string) => {
    setSections((current) => {
      const next = current.filter((section) => section.id !== id);
      if (selectedSectionId === id) {
        setSelectedSectionId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const updateSelectedProps = (props: Record<string, any>) => {
    if (!selectedSection) return;
    setSections((current) =>
      current.map((section) =>
        section.id === selectedSection.id
          ? { ...section, props: { ...section.props, ...props } }
          : section
      )
    );
  };

  const saveFunnel = async (status: 'draft' | 'active') => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await authFetch('/api/marketing/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          title,
          description,
          status,
          sections,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save funnel');
      }

      setMessage(status === 'active' ? `Published at /lp/${data.slug}` : `Draft saved as /lp/${data.slug}`);
    } catch (error: any) {
      setMessage(error.message || 'Unable to save funnel');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    if (!selectedSection) {
      return <p className="text-sm text-gray-500">Add a section to start editing.</p>;
    }

    const props = selectedSection.props;

    if (selectedSection.type === 'hero') {
      return (
        <div className="space-y-3">
          <Input value={props.eyebrow ?? ''} onChange={(event) => updateSelectedProps({ eyebrow: event.target.value })} />
          <Input value={props.headline ?? ''} onChange={(event) => updateSelectedProps({ headline: event.target.value })} />
          <Textarea value={props.subheadline ?? ''} onChange={(event) => updateSelectedProps({ subheadline: event.target.value })} />
          <Input value={props.ctaText ?? ''} onChange={(event) => updateSelectedProps({ ctaText: event.target.value })} />
        </div>
      );
    }

    if (selectedSection.type === 'three_cards') {
      return (
        <div className="space-y-3">
          <Input value={props.heading ?? ''} onChange={(event) => updateSelectedProps({ heading: event.target.value })} />
          {(props.cards ?? []).map((card: any, index: number) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <Input
                value={card.title ?? ''}
                onChange={(event) => {
                  const cards = [...(props.cards ?? [])];
                  cards[index] = { ...cards[index], title: event.target.value };
                  updateSelectedProps({ cards });
                }}
              />
              <Textarea
                value={card.body ?? ''}
                onChange={(event) => {
                  const cards = [...(props.cards ?? [])];
                  cards[index] = { ...cards[index], body: event.target.value };
                  updateSelectedProps({ cards });
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    if (selectedSection.type === 'qualification') {
      return (
        <div className="space-y-3">
          <Input value={props.heading ?? ''} onChange={(event) => updateSelectedProps({ heading: event.target.value })} />
          <Textarea value={props.intro ?? ''} onChange={(event) => updateSelectedProps({ intro: event.target.value })} />
          <Textarea
            value={(props.bullets ?? []).join('\n')}
            onChange={(event) => updateSelectedProps({ bullets: splitLines(event.target.value) })}
          />
        </div>
      );
    }

    if (selectedSection.type === 'signup') {
      return (
        <div className="space-y-3">
          <Input value={props.heading ?? ''} onChange={(event) => updateSelectedProps({ heading: event.target.value })} />
          <Textarea value={props.body ?? ''} onChange={(event) => updateSelectedProps({ body: event.target.value })} />
          <Input value={props.buttonText ?? ''} onChange={(event) => updateSelectedProps({ buttonText: event.target.value })} />
          <Input value={props.helperText ?? ''} onChange={(event) => updateSelectedProps({ helperText: event.target.value })} />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Input value={props.heading ?? ''} onChange={(event) => updateSelectedProps({ heading: event.target.value })} />
        <Textarea value={props.body ?? ''} onChange={(event) => updateSelectedProps({ body: event.target.value })} />
        <Input value={props.contact ?? ''} onChange={(event) => updateSelectedProps({ contact: event.target.value })} />
      </div>
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Funnel Builder</h1>
            <p className="mt-1 text-gray-600">Build reusable landing funnels from approved section blocks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.open(`/lp/${slug}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" disabled={saving} onClick={() => saveFunnel('draft')}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" disabled={saving} onClick={() => saveFunnel('active')}>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <Card className="xl:sticky xl:top-20 xl:self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LibraryBig className="h-5 w-5" />
                Section Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {funnelSectionTemplates.map((template) => (
                <button
                  key={template.type}
                  type="button"
                  onClick={() => addSection(template.type)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                      <p className="text-xs text-cyan-700">{template.category}</p>
                    </div>
                    <Plus className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{template.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funnel Setup</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Funnel name" />
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Page title" />
                <Input value={slug} readOnly className="bg-slate-50 font-mono text-xs" />
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Short description"
                  className="md:col-span-3"
                />
                {message ? <p className="text-sm font-medium text-cyan-700 md:col-span-3">{message}</p> : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Funnel Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`group relative border-b border-slate-200 last:border-b-0 ${
                        selectedSectionId === section.id ? 'ring-2 ring-inset ring-cyan-400' : ''
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <div className="absolute right-3 top-3 z-40 flex gap-1 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                        <Button size="icon" variant="outline" disabled={index === 0} onClick={() => moveSection(section.id, -1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" disabled={index === sections.length - 1} onClick={() => moveSection(section.id, 1)}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => removeSection(section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FunnelSectionPreview section={section} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="xl:sticky xl:top-20 xl:self-start">
            <CardHeader>
              <CardTitle className="text-lg">Section Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedSection ? (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <p className="text-xs font-semibold uppercase text-cyan-800">Selected</p>
                  <p className="text-sm font-semibold text-slate-950">
                    {funnelSectionTemplates.find((template) => template.type === selectedSection.type)?.name}
                  </p>
                </div>
              ) : null}
              {renderEditor()}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
