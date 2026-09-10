'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { OrbitHeader } from '@/components/orbit/orbit-header';
import { SharedScreens } from '@/components/orbit/screens/shared-screens';
import { CarScreens } from '@/components/orbit/screens/car-screens';
import { baseScreens, initialFormState } from '@/components/orbit/types';
import type { CoverFlow, OrbitFormState, ScreenKey } from '@/components/orbit/types';
import { cn } from '@/lib/utils';

export function OrbitApplication() {
  const [flow, setFlow] = useState<CoverFlow | null>(null);
  const [screen, setScreen] = useState<ScreenKey>('landing');
  const [form, setForm] = useState<OrbitFormState>(initialFormState);
  const [returnToBasketAfterVehicleEdit, setReturnToBasketAfterVehicleEdit] = useState(false);

  const screens = useMemo(() => {
    const selected = [...baseScreens[flow ?? 'car']];
    if (form.paymentMethod === 'card') {
      selected.splice(selected.indexOf('payment') + 1, 0, 'cardDetails');
    }
    if (form.paymentMethod === 'apple') {
      selected.splice(selected.indexOf('payment') + 1, 0, 'applePay');
    }
    if (form.paymentMethod === 'debit') {
      selected.splice(selected.indexOf('payment') + 1, 0, 'bank');
    }
    return selected;
  }, [flow, form.paymentMethod]);

  const stepIndex = Math.max(0, screens.indexOf(screen));

  const next = useCallback(() => {
    if (screen === 'identification' && returnToBasketAfterVehicleEdit) {
      setReturnToBasketAfterVehicleEdit(false);
      setScreen('basket');
      return;
    }
    if (screen === 'landing') {
      setScreen('selection');
      return;
    }
    const currentIndex = screens.indexOf(screen);
    const nextScreen = screens[currentIndex + 1];
    if (nextScreen) setScreen(nextScreen);
  }, [returnToBasketAfterVehicleEdit, screen, screens]);

  const back = () => {
    setReturnToBasketAfterVehicleEdit(false);
    if (screen === 'selection') {
      setScreen('landing');
      return;
    }
    const previous = screens[stepIndex - 1];
    if (previous) setScreen(previous);
  };

  const reset = () => {
    setReturnToBasketAfterVehicleEdit(false);
    setFlow(null);
    setScreen('landing');
    setForm(initialFormState);
  };

  const selectFlow = (selectedFlow: CoverFlow) => {
    setReturnToBasketAfterVehicleEdit(false);
    setFlow(selectedFlow);
    setScreen(baseScreens[selectedFlow][2]);
  };

  useEffect(() => {
    if (screen !== 'analysis' && screen !== 'processing') return;
    const timer = window.setTimeout(next, 950);
    return () => window.clearTimeout(timer);
  }, [next, screen]);

  return (
    <div className="relative flex h-full flex-col bg-white font-sans text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: "url('/app%20background.png')" }}
      />
      <OrbitHeader step={stepIndex + 1} total={screens.length} canGoBack={screen !== 'landing' && screen !== 'active'} onBack={back} />
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div key={screen} className={cn('min-h-full animate-in fade-in slide-in-from-right-2 px-5 pb-6 duration-200 motion-reduce:animate-none', screen === 'landing' || screen === 'active' ? 'pt-4' : 'pt-11')}>
          <CarScreens screen={screen} form={form} setForm={setForm} next={next} />
          <SharedScreens
            screen={screen}
            flow={flow}
            form={form}
            setForm={setForm}
            next={next}
            goTo={setScreen}
            onEditVehicle={() => {
              setReturnToBasketAfterVehicleEdit(true);
              setScreen('identification');
            }}
            selectFlow={selectFlow}
            onDone={reset}
          />
        </div>
      </div>
      <div id="orbit-app-overlay-root" className="pointer-events-none absolute inset-0 z-[100] overflow-hidden rounded-[2.45rem]" />
    </div>
  );
}
