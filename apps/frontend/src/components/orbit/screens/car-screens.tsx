import { Car, Pencil } from 'lucide-react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';

import { FieldLabel, PrimaryButton, ScreenIntro } from '@/components/orbit/orbit-ui';
import type { OrbitFormState, ScreenKey } from '@/components/orbit/types';
import { ImageChoiceCard } from '@/components/ui/card-25';
import { DateWheelPicker } from '@/components/ui/date-wheel-picker';
import { DeleteIconButton } from '@/components/ui/delete-icon-button';
import { ServiceCard } from '@/components/ui/service-card';
import { cn } from '@/lib/utils';

interface CarScreensProps {
  screen: ScreenKey;
  form: OrbitFormState;
  setForm: Dispatch<SetStateAction<OrbitFormState>>;
  next: () => void;
}

const vehicleAngleImages: Record<keyof OrbitFormState['photos'], string> = {
  Front: '/3d%20front%20car.png',
  Back: '/3d%20back%20car.png',
  'Left side': '/3d%20left%20side.png',
  'Right side': '/3d%20right%20side.png',
};

type IdentificationType = Exclude<OrbitFormState['identificationType'], ''>;

const identificationNames: Record<IdentificationType, string> = {
  id: 'ID Document',
  passport: 'Passport',
  license: "Driver's License",
};

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateValue(value: string) {
  const normalizedValue = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const date = new Date(`${normalizedValue}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function CarScreens({ screen, form, setForm, next }: CarScreensProps) {
  const photoCameraRef = useRef<HTMLInputElement>(null);
  const photoGalleryRef = useRef<HTMLInputElement>(null);
  const identificationCameraRef = useRef<HTMLInputElement>(null);
  const identificationGalleryRef = useRef<HTMLInputElement>(null);
  const registrationCameraRef = useRef<HTMLInputElement>(null);
  const registrationGalleryRef = useRef<HTMLInputElement>(null);
  const sheetDragControls = useDragControls();
  const [pendingRegistrationUpload, setPendingRegistrationUpload] = useState<'disc' | 'plate' | null>(null);
  const [uploadingRegistration, setUploadingRegistration] = useState<'disc' | 'plate' | null>(null);
  const [attentionCard, setAttentionCard] = useState<'disc' | 'plate' | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState<Array<keyof OrbitFormState['photos']>>([]);
  const [deletingPhoto, setDeletingPhoto] = useState<keyof OrbitFormState['photos'] | null>(null);
  const [pendingPhotoUpload, setPendingPhotoUpload] = useState<keyof OrbitFormState['photos'] | null>(null);
  const [pendingIdentificationUpload, setPendingIdentificationUpload] = useState<IdentificationType | null>(null);
  const lastAttentionCard = useRef<'disc' | 'plate' | null>(null);
  const registrationSheetRoot = typeof document === 'undefined' ? null : document.getElementById('orbit-app-overlay-root');

  useEffect(() => {
    if (screen !== 'registration') return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    let pulseTimer: ReturnType<typeof setTimeout>;

    const pulse = () => {
      const nextCard = lastAttentionCard.current === 'disc' ? 'plate' : 'disc';
      lastAttentionCard.current = nextCard;
      setAttentionCard(nextCard);
      pulseTimer = setTimeout(() => setAttentionCard(null), 1150);
      inactivityTimer = setTimeout(pulse, 3200);
    };

    const restart = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(pulseTimer);
      setAttentionCard(null);
      inactivityTimer = setTimeout(pulse, 2000);
    };

    const activityEvents: Array<keyof WindowEventMap> = ['pointermove', 'pointerdown', 'keydown', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, restart, { passive: true }));
    restart();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(pulseTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, restart));
    };
  }, [screen]);

  const addRegistrationImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingRegistrationUpload) return;
    const target = pendingRegistrationUpload;
    setUploadingRegistration(target);
    setPendingRegistrationUpload(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setUploadingRegistration(null);
        return;
      }
      const uploadedImage = reader.result;
      window.setTimeout(() => {
        setForm((value) => ({ ...value, registrationUploads: { ...value.registrationUploads, [target]: uploadedImage } }));
        setUploadingRegistration(null);
      }, 650);
    };
    reader.onerror = () => setUploadingRegistration(null);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const addVehiclePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingPhotoUpload) return;
    const target = pendingPhotoUpload;
    setUploadingPhotos((current) => Array.from(new Set([...current, target])));
    setPendingPhotoUpload(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setUploadingPhotos((current) => current.filter((item) => item !== target));
        return;
      }
      const uploadedImage = reader.result;
      window.setTimeout(() => {
        setForm((value) => ({ ...value, photos: { ...value.photos, [target]: uploadedImage } }));
        setUploadingPhotos((current) => current.filter((item) => item !== target));
      }, 650);
    };
    reader.onerror = () => setUploadingPhotos((current) => current.filter((item) => item !== target));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const addIdentificationImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pendingIdentificationUpload) return;
    const selectedType = pendingIdentificationUpload;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setForm((current) => ({ ...current, identificationType: selectedType, identificationImage: reader.result as string, licenseUploaded: true }));
      setPendingIdentificationUpload(null);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  if (screen === 'registration') {
    const ready = form.registrationUploads.disc && form.registrationUploads.plate;
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Vehicle details" title={<>Upload your<br />license disc</>} copy="Take a clear photo of your license disc and number plate." eyebrowClassName="text-[12px]" titleClassName="text-[28px] leading-[0.93]" copyClassName="text-[14px]" />
        <div className="space-y-[17px]">
          <input ref={registrationCameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take registration picture" onChange={addRegistrationImage} />
          <input ref={registrationGalleryRef} type="file" accept="image/*" className="hidden" aria-label="Choose registration picture" onChange={addRegistrationImage} />
          <ServiceCard className="min-h-[105px]" variant="home" title="License disc" actionLabel="Snap/Upload" imgSrc="/3d%20license%20disk.png" imgAlt="License disc upload" uploadedImage={form.registrationUploads.disc} isUploading={uploadingRegistration === 'disc'} attentionPulse={attentionCard === 'disc'} onRemoveImage={() => setForm((value) => ({ ...value, registrationUploads: { ...value.registrationUploads, disc: null } }))} onClick={() => { if (!uploadingRegistration) setPendingRegistrationUpload('disc'); }} />
          <ServiceCard className="min-h-[105px]" variant="both" title="Number plate" actionLabel="Snap/Upload" imgSrc="/3d%20license%20plate.png" imgAlt="Number plate upload" imageClassName="h-[118px] w-[118px]" uploadedImage={form.registrationUploads.plate} isUploading={uploadingRegistration === 'plate'} attentionPulse={attentionCard === 'plate'} onRemoveImage={() => setForm((value) => ({ ...value, registrationUploads: { ...value.registrationUploads, plate: null } }))} onClick={() => { if (!uploadingRegistration) setPendingRegistrationUpload('plate'); }} />
        </div>
        {registrationSheetRoot ? createPortal(<AnimatePresence>
          {pendingRegistrationUpload ? (
            <motion.div
              className="pointer-events-auto absolute inset-0 flex items-end bg-slate-950/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPendingRegistrationUpload(null)}
            >
              <motion.div
                className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-3 shadow-2xl"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                drag="y"
                dragListener={false}
                dragControls={sheetDragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.75 }}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 85 || info.velocity.y > 500) setPendingRegistrationUpload(null);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Drag upload options"
                  className="mx-auto mb-4 flex h-6 w-20 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                  onPointerDown={(event) => sheetDragControls.start(event)}
                >
                  <span className="h-1.5 w-14 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
                </button>
                <p className="text-sm font-bold text-slate-900">Add {pendingRegistrationUpload === 'disc' ? 'license disc' : 'number plate'} image</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center">
                      <img src="/3d%20camera.png" alt="Camera" className="h-[72px] w-[72px] object-contain" />
                    </span>
                    <button type="button" onClick={() => registrationCameraRef.current?.click()} className="w-full rounded-xl bg-[#1769ff] px-3 py-3 text-[18px] font-bold text-white">Camera</button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center">
                      <img src="/3d%20upload.png" alt="Upload" className="h-20 w-20 object-contain" />
                    </span>
                    <button type="button" onClick={() => registrationGalleryRef.current?.click()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[18px] font-bold text-slate-800">Upload</button>
                  </div>
                </div>
                <button type="button" onClick={() => setPendingRegistrationUpload(null)} className="mt-3 w-full py-2 text-[10px] font-semibold text-slate-500">Cancel</button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>, registrationSheetRoot) : null}
        <PrimaryButton disabled={!ready} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'photos') {
    const photoNames = Object.keys(form.photos) as Array<keyof OrbitFormState['photos']>;
    const ready = photoNames.every((name) => form.photos[name]);
    const uploadedCount = photoNames.filter((name) => form.photos[name]).length;
    const occupiedCount = uploadedCount + uploadingPhotos.length;
    return (
      <div className="space-y-4">
        <ScreenIntro eyebrow="Vehicle condition" title="Give us a quick look" copy="Show us the front, back and both sides of your car." />
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
          <input ref={photoCameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take vehicle picture" onChange={addVehiclePhoto} />
          <input ref={photoGalleryRef} type="file" accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif" className="hidden" aria-label="Upload vehicle picture" onChange={addVehiclePhoto} />
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-bold text-slate-700">Uploaded Files ({uploadedCount}/4)</p>
            <p className="whitespace-nowrap text-[9px] font-semibold text-slate-500">{occupiedCount === 4 ? 'All angles added' : `${4 - occupiedCount} remaining`}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photoNames.map((name) => {
              const isUploading = uploadingPhotos.includes(name);
              const isDeleting = deletingPhoto === name;
              return (
              <div key={name} className="relative h-28 overflow-visible rounded-lg border border-slate-200 bg-white shadow-sm">
                <button type="button" disabled={isUploading} onClick={() => setPendingPhotoUpload(name)} className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[7px] bg-slate-100 text-center disabled:cursor-wait">
                  <AnimatePresence mode="wait" initial={false}>
                  {isUploading ? (
                    <motion.span key="uploading" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }} className="flex flex-col items-center gap-2 text-[9px] font-bold text-[#1769ff]">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-[#1769ff] motion-reduce:animate-none" />
                      Uploading...
                    </motion.span>
                  ) : form.photos[name] ? (
                    <motion.img key={form.photos[name]} src={form.photos[name] ?? ''} alt={`${name} vehicle preview`} initial={{ opacity: 0, scale: 0.75 }} animate={isDeleting ? { opacity: 0, scale: 0.5, rotate: 8 } : { opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="h-full w-full object-contain" />
                  ) : (
                    <motion.span key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center"><img src={vehicleAngleImages[name]} alt={`${name} of vehicle`} className="mb-1 h-14 w-20 object-contain" /><span className="text-[10px] font-bold text-slate-700">{name}</span><span className="text-[8px] text-slate-400">Add image</span></motion.span>
                  )}
                  </AnimatePresence>
                </button>
                {form.photos[name] && !isUploading ? (
                  <motion.span animate={isDeleting ? { opacity: 0, scale: 0, rotate: 90 } : { opacity: 1, scale: 0.75, rotate: 0 }} transition={{ duration: 0.25 }} className="absolute -right-1 -top-1 z-10 origin-center">
                    <DeleteIconButton label={`Remove ${name} image`} onClick={() => {
                      if (deletingPhoto) return;
                      setDeletingPhoto(name);
                      window.setTimeout(() => {
                        setForm((value) => ({ ...value, photos: { ...value.photos, [name]: null } }));
                        setDeletingPhoto(null);
                      }, 280);
                    }} />
                  </motion.span>
                ) : null}
                <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-slate-700">{name}</span>
              </div>
            )})}
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-slate-500">
            Keep the <strong className="font-bold text-slate-700">whole car</strong> in frame, use <strong className="font-bold text-slate-700">good lighting</strong>, and avoid blur.
          </p>
        </div>
        {registrationSheetRoot ? createPortal(<AnimatePresence>
          {pendingPhotoUpload ? (
            <motion.div
              className="pointer-events-auto absolute inset-0 flex items-end bg-slate-950/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPendingPhotoUpload(null)}
            >
              <motion.div
                className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-3 shadow-2xl"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                drag="y"
                dragListener={false}
                dragControls={sheetDragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.75 }}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 85 || info.velocity.y > 500) setPendingPhotoUpload(null);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" aria-label="Drag upload options" className="mx-auto mb-4 flex h-6 w-20 cursor-grab touch-none items-center justify-center active:cursor-grabbing" onPointerDown={(event) => sheetDragControls.start(event)}>
                  <span className="h-1.5 w-14 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
                </button>
                <p className="text-sm font-bold capitalize text-slate-900">Add {pendingPhotoUpload} image</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20camera.png" alt="Camera" className="h-[72px] w-[72px] object-contain" /></span>
                    <button type="button" onClick={() => photoCameraRef.current?.click()} className="w-full rounded-xl bg-[#1769ff] px-3 py-3 text-[18px] font-bold text-white">Camera</button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20upload.png" alt="Upload" className="h-20 w-20 object-contain" /></span>
                    <button type="button" onClick={() => photoGalleryRef.current?.click()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[18px] font-bold text-slate-800">Upload</button>
                  </div>
                </div>
                <button type="button" onClick={() => setPendingPhotoUpload(null)} className="mt-3 w-full py-2 text-[10px] font-semibold text-slate-500">Cancel</button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>, registrationSheetRoot) : null}
        <PrimaryButton disabled={!ready} onClick={next}>Analyse vehicle</PrimaryButton>
      </div>
    );
  }

  if (screen === 'analysis') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Smart vehicle check" title="Analysing your car" copy="Checking the registration, condition and vehicle details." />
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <Car className="h-10 w-10 text-[#1769ff]" />
            <span className="absolute inset-0 animate-ping rounded-full border border-blue-200 motion-reduce:animate-none" />
          </div>
          <div className="flex gap-1"><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff] [animation-delay:120ms]" /><i className="h-2 w-2 animate-bounce rounded-full bg-[#1769ff] [animation-delay:240ms]" /></div>
        </div>
      </div>
    );
  }

  if (screen === 'identification') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Vehicle identified" title="We found your car." copy="Check these details before continuing." />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-3"><span className="flex h-12 w-16 shrink-0 items-center justify-center"><img src="/3d%20car%20specific%20angle.png" alt="Detected vehicle" className="h-full w-full object-contain" /></span><div><p className="text-[10px] uppercase text-slate-500">Detected vehicle</p><p className="text-sm font-bold text-slate-900">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</p></div></div>
          <div className="space-y-3">
            {(['make', 'model', 'year'] as const).map((field) => <div key={field}><FieldLabel>{field}</FieldLabel><div className="relative"><input value={form.vehicle[field]} onChange={(event) => setForm((value) => ({ ...value, vehicle: { ...value.vehicle, [field]: event.target.value } }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[12px] font-semibold text-slate-900 outline-none focus:border-[#1769ff]" /><Pencil className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" /></div></div>)}
          </div>
        </div>
        <PrimaryButton disabled={!form.vehicle.make || !form.vehicle.model || !form.vehicle.year} onClick={next}>Confirm vehicle</PrimaryButton>
      </div>
    );
  }

  if (screen === 'license') {
    return (
      <div className="space-y-10">
        <ScreenIntro eyebrow="Driver details" title={<>Select your<br />Identification Type</>} copy="Choose the document you want to use." />
        <input ref={identificationCameraRef} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take identification picture" onChange={addIdentificationImage} />
        <input ref={identificationGalleryRef} type="file" accept="image/*" className="hidden" aria-label="Upload identification picture" onChange={addIdentificationImage} />
        <ImageChoiceCard
          className="translate-x-[60px] translate-y-[30px]"
          selected={form.identificationType}
          uploadedImage={form.identificationImage}
          onRemoveUploadedImage={() => setForm((current) => ({ ...current, identificationImage: null, licenseUploaded: false }))}
          images={[
            { src: '/orbit-identification/id-card.svg', alt: 'Choose ID Document', value: 'id', label: identificationNames.id },
            { src: '/orbit-identification/passport.svg', alt: 'Choose Passport', value: 'passport', label: identificationNames.passport },
            { src: '/orbit-identification/drivers-licence.svg', alt: "Choose Driver's License", value: 'license', label: identificationNames.license },
          ]}
          onSelect={(value) => {
            const selectedType = value as IdentificationType;
            setForm((current) => ({ ...current, identificationType: selectedType, identificationImage: null, licenseUploaded: false }));
            setPendingIdentificationUpload(selectedType);
          }}
        />
        {registrationSheetRoot ? createPortal(<AnimatePresence>
          {pendingIdentificationUpload ? (
            <motion.div className="pointer-events-auto absolute inset-0 flex items-end bg-slate-950/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setPendingIdentificationUpload(null)}>
              <motion.div
                className="w-full rounded-t-3xl bg-white px-4 pb-5 pt-3 shadow-2xl"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                drag="y"
                dragListener={false}
                dragControls={sheetDragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.75 }}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 85 || info.velocity.y > 500) setPendingIdentificationUpload(null);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" aria-label="Drag upload options" className="mx-auto mb-4 flex h-6 w-20 cursor-grab touch-none items-center justify-center active:cursor-grabbing" onPointerDown={(event) => sheetDragControls.start(event)}>
                  <span className="h-1.5 w-14 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
                </button>
                <p className="text-sm font-bold text-slate-900">Add {identificationNames[pendingIdentificationUpload]} image</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20camera.png" alt="Camera" className="h-[72px] w-[72px] object-contain" /></span>
                    <button type="button" onClick={() => identificationCameraRef.current?.click()} className="w-full rounded-xl bg-[#1769ff] px-3 py-3 text-[18px] font-bold text-white">Camera</button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-20 items-center justify-center"><img src="/3d%20upload.png" alt="Upload" className="h-20 w-20 object-contain" /></span>
                    <button type="button" onClick={() => identificationGalleryRef.current?.click()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[18px] font-bold text-slate-800">Upload</button>
                  </div>
                </div>
                <button type="button" onClick={() => setPendingIdentificationUpload(null)} className="mt-3 w-full py-2 text-[10px] font-semibold text-slate-500">Cancel</button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>, registrationSheetRoot) : null}
        <PrimaryButton className="translate-y-[65px]" disabled={!form.licenseUploaded} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'usage') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Vehicle use" title="How do you use your car?" copy="Choose the option that best matches your driving." />
        <div className="space-y-[17px]">
          <ServiceCard className={cn('min-h-[105px]', form.usage === 'private' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="car" title="Private use only" actionLabel="Commuting, errands, leisure" radioSelected={form.usage === 'private'} radioClassName="ml-[16px]" aria-pressed={form.usage === 'private'} imgSrc="/3d%20private%20use.png" imgAlt="Private vehicle use" onClick={() => setForm((value) => ({ ...value, usage: 'private' }))} />
          <ServiceCard className={cn('min-h-[105px]', form.usage === 'business' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="home" title="Private + business use" titleClassName="max-w-[78%] whitespace-nowrap" actionLabel="Personal and work use" radioSelected={form.usage === 'business'} radioClassName="ml-[52px]" aria-pressed={form.usage === 'business'} imgSrc="/3d%20private%20%2B%20business.png" imgAlt="Private and business vehicle use" onClick={() => setForm((value) => ({ ...value, usage: 'business' }))} />
        </div>
        <PrimaryButton disabled={!form.usage} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'accident') {
    const ready = form.accident === 'no' || (form.accident === 'yes' && Boolean(form.accidentDate));
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Driving history" title="Any recent accidents?" copy="Tell us about accidents in the last five years." />
        <div className="space-y-[17px]">
          <ServiceCard className={cn('min-h-[105px]', form.accident === 'no' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="car" title="No accidents" actionLabel="None in the last five years" radioSelected={form.accident === 'no'} radioClassName="ml-[13px]" aria-pressed={form.accident === 'no'} imgSrc="/3d%20car.png" imgAlt="No accident history" onClick={() => setForm((value) => ({ ...value, accident: 'no', accidentDate: '' }))} />
          <ServiceCard className={cn('min-h-[105px]', form.accident === 'yes' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="home" title="Yes, I have" actionLabel="I’ve had an accident in the last five years" actionClassName="max-w-[72%] text-[11px] italic leading-tight" radioSelected={form.accident === 'yes'} radioClassName="ml-2 shrink-0" aria-pressed={form.accident === 'yes'} imgSrc="/3d%20car%20accident.png" imgAlt="Declare accident history" onClick={() => setForm((value) => ({ ...value, accident: 'yes', accidentDate: value.accidentDate || formatDateValue(new Date()) }))} />
        </div>
        {form.accident === 'yes' ? (
          <div>
            <FieldLabel>Most recent accident</FieldLabel>
            <DateWheelPicker
              value={parseDateValue(form.accidentDate)}
              onChange={(date) => setForm((value) => ({ ...value, accidentDate: formatDateValue(date) }))}
              minYear={new Date().getFullYear() - 5}
              maxYear={new Date().getFullYear()}
              size="sm"
              className="mt-2"
            />
          </div>
        ) : null}
        <PrimaryButton disabled={!ready} onClick={next}>Continue</PrimaryButton>
      </div>
    );
  }

  if (screen === 'finance') {
    return (
      <div className="space-y-5">
        <ScreenIntro eyebrow="Vehicle finance" title="Is the car financed?" copy="This helps us structure the correct cover." />
        <div className="space-y-[17px]">
          <ServiceCard className={cn('min-h-[105px]', form.finance === 'financed' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="car" title="Still financed" actionLabel="Monthly repayment active" radioSelected={form.finance === 'financed'} aria-pressed={form.finance === 'financed'} imgSrc="/3d%20car.png" imgAlt="Financed vehicle" onClick={() => setForm((value) => ({ ...value, finance: 'financed' }))} />
          <ServiceCard className={cn('min-h-[105px]', form.finance === 'paid' && 'ring-2 ring-[#1769ff] ring-offset-2')} variant="home" title="Paid up, all mine" actionLabel="No finance outstanding" radioSelected={form.finance === 'paid'} aria-pressed={form.finance === 'paid'} imgSrc="/3d%20car.png" imgAlt="Paid-up vehicle" onClick={() => setForm((value) => ({ ...value, finance: 'paid' }))} />
        </div>
        <PrimaryButton disabled={!form.finance} onClick={next}>Get my quote</PrimaryButton>
      </div>
    );
  }

  return null;
}
