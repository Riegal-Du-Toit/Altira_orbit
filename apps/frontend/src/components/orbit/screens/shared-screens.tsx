import { BarChart3, CalendarDays, Check, Coins, FileText, Home, LockKeyhole, Pencil, ShieldCheck, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { FieldLabel, PrimaryButton, ScreenIntro } from '@/components/orbit/orbit-ui';
import type { CoverFlow, OrbitFormState, PaymentMethod, ScreenKey } from '@/components/orbit/types';
import { AnimatedTicket } from '@/components/ui/ticket-confirmation-card';
import { AnimatedSplashButton } from '@/components/ui/animated-splash-button';
import { ServiceCard } from '@/components/ui/service-card';
import { FakeApplePay } from '@/components/ui/fake-apple-pay';
import { CardDetailsPayment } from '@/components/orbit/card-details-payment';
import { BankStatementUpload } from '@/components/orbit/bank-statement-upload';
import { ThankYouButton } from '@/components/orbit/thank-you-button';
import { HomeItemsUpload } from '@/components/orbit/home-items-upload';
import { CircularCarousel } from '@/components/ui/circular-carousel';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface SharedScreensProps {
  screen: ScreenKey;
  flow: CoverFlow | null;
  form: OrbitFormState;
  setForm: Dispatch<SetStateAction<OrbitFormState>>;
  next: () => void;
  goTo: (screen: ScreenKey) => void;
  onEditVehicle: () => void;
  selectFlow: (flow: CoverFlow) => void;
  onDone: () => void;
}

const paymentOptions: Array<{ id: PaymentMethod; title: string; description: string; image: string }> = [
  { id: 'card', title: 'Credit or debit card', description: 'Secure card payment', image: '/3d%20debit%20card.png' },
  { id: 'apple', title: 'Apple Pay', description: 'Secure Apple payment', image: '/3d%20apple%20pay.png' },
  { id: 'debit', title: 'Debit order', description: 'Secure bank payment', image: '/3d%20bank%20statement.png' },
];

function formatRand(value: number) {
  return `R${Math.round(value).toLocaleString('en-ZA')}`;
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getPremium(flow: CoverFlow | null, coverAmount: number) {
  const car = 1053;
  const home = Math.round(390 + coverAmount * 0.00115);
  return { car, home, total: flow === 'both' ? car + home : flow === 'home' ? home : car };
}

export function SharedScreens(props: SharedScreensProps) {
  const { screen, flow, form, setForm, next, goTo, onEditVehicle, selectFlow, onDone } = props;
  const premium = getPremium(flow, form.coverAmount);

  if (screen === 'landing') {
    return (
      <div className="flex min-h-[540px] flex-col">
        <div className="pt-24"><ScreenIntro eyebrow="Get covered" title={<>Home &amp; Auto Cover<br />In Minutes</>} copy="Get a real, final price on your car or home in under two minutes. No call centre, no forms to print." /></div>
        <div className="flex flex-1 items-center justify-center py-4">
          <img src="/landing%20page%20svg.png" alt="Home and auto insurance" className="max-h-[14.52rem] w-[120%] max-w-none object-contain" />
        </div>
        <div className="mt-auto space-y-3">
          <div className="flex justify-center py-1"><AnimatedSplashButton label="Get my price" onComplete={next} /></div>
          <p className="flex items-center justify-center gap-1 text-[9px] text-slate-500"><ShieldCheck className="h-3 w-3 text-[#1769ff]" /> Trusted. Secure. FCA compliant.</p>
        </div>
      </div>
    );
  }

  if (screen === 'selection') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="What do you want to insure?" title={<>Let's get you<br />covered.</>} copy="Choose the cover that fits your needs." />
        <div className="space-y-3">
          <ServiceCard className="min-h-[105px]" variant="car" title="Car" imgSrc="/3d%20car.png" imgAlt="Car insurance" onClick={() => selectFlow('car')} />
          <ServiceCard className="min-h-[105px]" variant="home" title="Home" imgSrc="/3d%20home.png" imgAlt="Home insurance" onClick={() => selectFlow('home')} />
          <ServiceCard className="min-h-[105px]" variant="both" title="Both" imgSrc="/3d%20home%20%2B%20car.png" imgAlt="Car and home insurance" onClick={() => selectFlow('both')} />
        </div>
      </div>
    );
  }

  if (screen === 'items') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Home contents" title={<>Let's round up<br />your valuables.</>} copy="Add photos of the items you want to cover." />
        <HomeItemsUpload items={form.homeItemUploads} onChange={(items) => setForm((value) => ({ ...value, homeItemUploads: items, homeItems: items.map((item) => item.title) }))} />
        <PrimaryButton disabled={form.homeItemUploads.length === 0} onClick={next}>Continue with {form.homeItemUploads.length || 0} item{form.homeItemUploads.length === 1 ? '' : 's'}</PrimaryButton>
      </div>
    );
  }

  if (screen === 'processing') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Building your quote" title={flow === 'both' ? 'Combining your cover' : 'Finding your best price'} copy="Using your details to prepare a clear, final premium." />
        <div className="flex min-h-[310px] flex-col items-center justify-center text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50"><Sparkles className="h-9 w-9 text-[#1769ff]" /><span className="absolute inset-0 animate-ping rounded-full border border-blue-200 motion-reduce:animate-none" /></div>
          <div className="flex gap-1"><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff] [animation-delay:120ms]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff] [animation-delay:240ms]" /></div>
        </div>
      </div>
    );
  }

  if (screen === 'basket') {
    return (
      <div className="space-y-4">
        <ScreenIntro eyebrow="Your basket" title={<>Here's what we've<br />got so far</>} />
        {flow !== 'home' ? (
          <div className="flex justify-center">
            <img src="/3d%20car%20specific%20angle.png" alt="Your insured car" className="h-[161px] w-full object-contain" />
          </div>
        ) : null}
        {flow !== 'home' ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-extrabold text-slate-900">{form.vehicle.make} {form.vehicle.model}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{form.vehicle.year} · Private{form.usage === 'business' ? ' · Business' : ''}</p>
            </div>
            <button type="button" onClick={onEditVehicle} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-[9px] font-bold text-[#1769ff] hover:bg-blue-100">
              <Pencil className="h-3 w-3" />
              Edit vehicle
            </button>
          </div>
        ) : null}
        {flow !== 'home' ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Accident history', value: 'Declared', icon: FileText },
              { label: 'Finance status', value: 'Paid up', icon: Coins },
              { label: 'Cover type', value: 'Comprehensive', icon: ShieldCheck },
              { label: 'Excess', value: 'R6,000', icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-4 w-4 text-[#1769ff]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[8px] leading-3 text-slate-500">{label}</p>
                  <p className="truncate text-[10px] font-extrabold leading-4 text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {flow !== 'car' ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50"><Home className="h-5 w-5 text-[#1769ff]" /></span>
              <div><p className="text-[11px] font-bold text-slate-900">Home contents</p><p className="text-[9px] text-slate-500">{form.homeItems.length} items · {formatRand(form.coverAmount)} cover</p></div>
            </div>
            <button type="button" onClick={() => goTo('items')} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-[9px] font-bold text-[#1769ff] hover:bg-blue-100"><Pencil className="h-3 w-3" />Edit</button>
          </div>
        ) : null}
        {flow !== 'car' && form.homeItemUploads.length ? (
          <CircularCarousel items={form.homeItemUploads.map((item) => ({ id: item.id, title: item.title, description: 'Home contents', image: item.image }))} />
        ) : null}
        <PrimaryButton onClick={next}>See my price</PrimaryButton>
      </div>
    );
  }

  if (screen === 'price') {
    return (
      <div className="space-y-3">
        <ScreenIntro eyebrow="Your price" title={<><span className="text-[38px] text-[#1769ff]">{formatRand(premium.total)}</span><span className="ml-1 text-sm tracking-normal text-slate-500">/ month</span></>} copy={flow === 'both' ? `Car ${formatRand(premium.car)} + Home ${formatRand(premium.home)}` : undefined} />
        {flow !== 'home' ? (
          <div className="flex min-h-[102px] items-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="flex w-[48%] items-center justify-center">
              <img src="/3d%20car%20specific%20angle.png" alt={`${form.vehicle.make} ${form.vehicle.model}`} className="h-[82px] w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-extrabold text-slate-900">{form.vehicle.make} {form.vehicle.model}</p>
              <p className="mt-0.5 text-[9px] text-slate-500">{form.vehicle.year} · Private{form.usage === 'business' ? ' · Business' : ''}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-slate-800">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1769ff]" />
                Comprehensive
              </span>
            </div>
          </div>
        ) : null}
        {flow !== 'car' ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><FieldLabel>Contents cover amount</FieldLabel><b className="text-[12px] text-[#1769ff]">{formatRand(form.coverAmount)}</b></div><input aria-label="Contents cover amount" type="range" min="50000" max="500000" step="25000" value={form.coverAmount} onChange={(event) => setForm((value) => ({ ...value, coverAmount: Number(event.target.value) }))} className="mt-3 w-full accent-[#1769ff]" /><div className="flex justify-between text-[9px] text-slate-400"><span>R50,000</span><span>R500,000</span></div></div> : null}
        <div className="space-y-3 rounded-xl bg-blue-50 p-3.5">
          {[
            ['No hidden admin fees', 'The price you see is the price you pay.'],
            ['Cancel any time, no penalties', 'Flexible cover that works for you.'],
            ['Cover starts today if you like it', 'Get on the road with confidence.'],
          ].map(([benefit, description]) => (
            <div key={benefit} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3.5 w-3.5 text-emerald-600" /></span>
              <div><p className="text-[11px] font-bold leading-4 text-slate-900">{benefit}</p><p className="text-[9px] leading-3 text-slate-500">{description}</p></div>
            </div>
          ))}
        </div>
        <div className="space-y-2.5 pt-1">
          <PrimaryButton onClick={next}>Accept this quote</PrimaryButton>
          <div className="flex items-center gap-2 px-10"><span className="h-px flex-1 bg-slate-200" /><span className="text-[9px] text-slate-400">or</span><span className="h-px flex-1 bg-slate-200" /></div>
          <button type="button" onClick={() => goTo('basket')} className="flex w-full items-center justify-center gap-1.5 py-1 text-[11px] font-semibold text-[#1769ff]"><SlidersHorizontal className="h-3.5 w-3.5" />Adjust my quote</button>
        </div>
      </div>
    );
  }

  if (screen === 'payment') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Payment" title={<>How would you<br />like to pay?</>} copy="Choose how you'd like your monthly premium collected." />
        <div className="space-y-[17px]">{paymentOptions.map(({ id, title, description, image }, index) => <ServiceCard key={id} className={cn('min-h-[105px]', form.paymentMethod === id && 'ring-2 ring-[#1769ff] ring-offset-2')} variant={(['car', 'home', 'both'] as const)[index]} title={title} titleClassName="max-w-[78%]" actionLabel={description} actionClassName="w-[155px] justify-between whitespace-nowrap text-[11px]" radioSelected={form.paymentMethod === id} radioClassName="ml-0" aria-pressed={form.paymentMethod === id} imgSrc={image} imgAlt={`${title} payment`} imageClassName="-bottom-2 -right-2 h-[96px] w-[96px]" onClick={() => setForm((value) => ({ ...value, paymentMethod: id }))} />)}</div>
        <PrimaryButton disabled={!form.paymentMethod} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'cardDetails') {
    return (
      <div className="space-y-3">
        <ScreenIntro eyebrow="Payment details" title="Enter your card details" copy="Add the card you want to use for your monthly premium." />
        <CardDetailsPayment onComplete={next} />
      </div>
    );
  }

  if (screen === 'applePay') {
    return (
      <div className="space-y-4">
        <ScreenIntro eyebrow="Apple Pay" title="Confirm your payment" copy="Review the details below, then use the simulated Apple Pay button." />
        <FakeApplePay amount={`${formatRand(premium.total)} / month`} onComplete={next} />
      </div>
    );
  }

  if (screen === 'bank') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Verify your details" title={<>Upload a recent<br />bank statement</>} copy="Since you've chosen debit order, we need this to confirm your account details match what you've given us." />
        <p className="rounded-lg bg-blue-50 p-3 text-[10px] leading-4 text-blue-800">Last 3 months, showing your name and account number.</p>
        <BankStatementUpload uploadedImage={form.bankUploaded} onUpload={(image) => setForm((value) => ({ ...value, bankUploaded: image }))} onRemove={() => setForm((value) => ({ ...value, bankUploaded: null }))} />
        <PrimaryButton disabled={!form.bankUploaded} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'paymentDate') {
    const selectedPaymentDate = form.paymentDate ? new Date(`${form.paymentDate}T00:00:00`) : undefined;
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Payment date" title="Choose your debit date" copy="We'll collect your monthly premium on this date." />
        <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <Calendar
            mode="single"
            selected={selectedPaymentDate}
            onSelect={(date) => setForm((value) => ({ ...value, paymentDate: date ? toDateValue(date) : '' }))}
            disabled={{ before: new Date() }}
            showOutsideDays={false}
            className="text-slate-900"
            classNames={{
              caption_label: 'text-[13px] font-extrabold text-[#1769ff]',
              weekday: 'size-9 p-0 text-[10px] font-bold text-slate-400',
              day: 'group size-9 px-0 text-[11px]',
              selected: 'rounded-lg bg-[#1769ff] text-white',
            }}
          />
        </div>
        <PrimaryButton disabled={!form.paymentDate} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'coverStart') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Cover start" title="Want cover today?" copy="Pay a small once-off amount now and activate your cover immediately. The balance can be paid on your selected payment date." eyebrowClassName="mb-2 text-[12px]" titleClassName="text-[29px]" copyClassName="mt-2 text-[13px] leading-[1.42]" />
        <div className="relative min-h-[142px] overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-[#eaf5ff] to-white p-4">
          <div className="relative z-10 w-[49%]"><p className="text-[10px] font-extrabold uppercase tracking-wide text-[#1769ff]">Cover from today</p><p className="mt-1 text-[40px] font-black leading-none tracking-tight text-[#1769ff]">R309</p><span className="mt-3 inline-block text-[10px] font-semibold leading-4 text-[#1769ff]">Pay for a full month cover</span></div>
          <img src="/3d%20car%20specific%20angle.png" alt="Your insured vehicle" className="absolute -bottom-4 right-0 h-[148px] w-[190px] object-contain" />
        </div>
        <div className="grid grid-cols-3 gap-2 px-1 text-center">
          {[
            { icon: Zap, title: 'Instant cover', copy: 'Protected today' },
            { icon: CalendarDays, title: 'Flexible payments', copy: 'Choose your date' },
            { icon: ShieldCheck, title: 'Same great cover', copy: 'Full cover today' },
          ].map(({ icon: Icon, title, copy }) => <div key={title} className="flex flex-col items-center"><span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50"><Icon className="h-5 w-5 text-[#1769ff]" /></span><p className="whitespace-nowrap text-[9.5px] font-extrabold leading-4 text-slate-800">{title}</p><p className="whitespace-nowrap text-[8.5px] leading-3 text-slate-500">{copy}</p></div>)}
        </div>
        <div className="space-y-3 pt-2"><PrimaryButton className="-translate-y-[15px]" onClick={() => { setForm((value) => ({ ...value, coverStart: 'today' })); next(); }}>Yes, get cover now</PrimaryButton><p className="!mt-[-5px] flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500"><LockKeyhole className="h-3.5 w-3.5" />Secure payment powered by <span className="font-bold text-[#1769ff]">PayFast</span></p><button type="button" onClick={() => { setForm((value) => ({ ...value, coverStart: 'payment-date' })); next(); }} className="w-full px-3 py-1 text-[12.5px] font-semibold text-emerald-600">No thanks, start on my selected date</button></div>
      </div>
    );
  }

  if (screen === 'confirmation') {
    return (
      <div className="space-y-4">
        <ScreenIntro eyebrow="Terms & conditions" title="Review your policy terms" copy="Please accept the terms before choosing how you would like to pay." />
        <div className="h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[9px] leading-4 text-slate-600"><b className="text-slate-900">Policy Terms &amp; Conditions</b><p className="mt-2">Your cover is subject to the information supplied in this application being complete and accurate. The monthly premium is collected using your selected payment method.</p><p className="mt-2">Comprehensive vehicle cover includes accidental damage, theft and third-party liability, subject to the stated excess. Home contents cover applies up to the selected amount and policy limits.</p><p className="mt-2">You may cancel subject to the policy terms. Claims and material changes must be reported promptly.</p></div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm((value) => ({ ...value, termsAccepted: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-[#1769ff]" /><span className="text-[10px] leading-4 text-slate-600">I've read and agree to the Policy Terms &amp; Conditions and the payment terms above.</span></label>
        <PrimaryButton disabled={!form.termsAccepted} onClick={next}>Agree &amp; continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'active') {
    return (
      <div className="relative flex min-h-[535px] flex-col justify-center py-3">
        <AnimatedTicket ticketId="ORB-2026-001053" amount={premium.total} date={new Date('2026-09-09T10:15:00')} cardHolder="Orbit Customer" last4Digits="8237" barcodeValue="28937261273650" />
        <div className="relative z-20 mt-4"><ThankYouButton onComplete={onDone} /></div>
      </div>
    );
  }

  return null;
}
