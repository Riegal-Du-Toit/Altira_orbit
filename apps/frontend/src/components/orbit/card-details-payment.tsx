'use client';

import { useCallback, useState } from 'react';

import { CreditCardForm, type CardValidity } from '@/components/ui/credit-card-form';
import { SwipeConfirmButton } from '@/components/ui/swipe-confirm-button';

export function CardDetailsPayment({ onComplete }: { onComplete: () => void }) {
  const [valid, setValid] = useState(false);
  const handleChange = useCallback((_: unknown, validity: CardValidity) => setValid(validity.allValid), []);

  return (
    <div className="space-y-1">
      <CreditCardForm defaultNumber="4242 4242 4242 4242" maskMiddle ring1="#53c7ff" ring2="#1769ff" showSubmit={false} onChange={handleChange} />
      <SwipeConfirmButton disabled={!valid} onConfirm={onComplete} />
    </div>
  );
}
