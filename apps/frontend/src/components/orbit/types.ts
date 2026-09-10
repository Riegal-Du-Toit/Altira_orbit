export type CoverFlow = 'car' | 'home' | 'both';
export type PaymentMethod = 'card' | 'apple' | 'debit';

export interface HomeItemUpload {
  id: string;
  title: string;
  image: string;
}
export type ScreenKey =
  | 'landing'
  | 'selection'
  | 'registration'
  | 'photos'
  | 'analysis'
  | 'identification'
  | 'license'
  | 'usage'
  | 'accident'
  | 'finance'
  | 'items'
  | 'processing'
  | 'basket'
  | 'price'
  | 'payment'
  | 'cardDetails'
  | 'applePay'
  | 'bank'
  | 'paymentDate'
  | 'coverStart'
  | 'confirmation'
  | 'active';

export interface OrbitFormState {
  registrationUploads: Record<'disc' | 'plate', string | null>;
  photos: Record<'Front' | 'Back' | 'Left side' | 'Right side', string | null>;
  vehicle: { make: string; model: string; year: string };
  identificationType: '' | 'id' | 'passport' | 'license';
  identificationImage: string | null;
  licenseUploaded: boolean;
  usage: '' | 'private' | 'business';
  accident: '' | 'no' | 'yes';
  accidentDate: string;
  finance: '' | 'financed' | 'paid';
  homeItems: string[];
  homeItemUploads: HomeItemUpload[];
  coverAmount: number;
  paymentMethod: PaymentMethod | null;
  bankUploaded: string | null;
  paymentDate: string;
  coverStart: '' | 'today' | 'payment-date';
  termsAccepted: boolean;
}

export const baseScreens: Record<CoverFlow, ScreenKey[]> = {
  car: ['landing', 'selection', 'registration', 'photos', 'analysis', 'identification', 'license', 'usage', 'accident', 'finance', 'processing', 'basket', 'price', 'paymentDate', 'confirmation', 'coverStart', 'payment', 'active'],
  home: ['landing', 'selection', 'items', 'processing', 'basket', 'price', 'paymentDate', 'confirmation', 'payment', 'active'],
  both: ['landing', 'selection', 'registration', 'photos', 'analysis', 'identification', 'license', 'usage', 'accident', 'finance', 'items', 'processing', 'basket', 'price', 'paymentDate', 'confirmation', 'coverStart', 'payment', 'active'],
};

export const initialFormState: OrbitFormState = {
  registrationUploads: { disc: null, plate: null },
  photos: { Front: null, Back: null, 'Left side': null, 'Right side': null },
  vehicle: { make: 'Volkswagen', model: 'Polo Vivo', year: '2021' },
  identificationType: '',
  identificationImage: null,
  licenseUploaded: false,
  usage: '',
  accident: '',
  accidentDate: '',
  finance: '',
  homeItems: [],
  homeItemUploads: [],
  coverAmount: 150000,
  paymentMethod: null,
  bankUploaded: null,
  paymentDate: '',
  coverStart: '',
  termsAccepted: false,
};
