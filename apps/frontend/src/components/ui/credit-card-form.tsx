'use client';

import { useEffect, useMemo, useState } from 'react';

export type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

export type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

type CreditCardFormProps = {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
};

function clampDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function formatNumber(value: string) {
  return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function passesLuhn(value: string) {
  if (value.length < 13) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

export function CreditCardForm({
  defaultNumber = '',
  defaultHolder = '',
  defaultMonth = '',
  defaultYear = '',
  defaultCVV = '',
  maskMiddle = true,
  ring1 = '#53c7ff',
  ring2 = '#1769ff',
  showSubmit = true,
  onChange,
  onSubmit,
  className = '',
}: CreditCardFormProps) {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<'number' | 'holder' | 'expire' | 'cvv' | null>(null);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => String(currentYear + index));
  }, []);

  const validity = useMemo<CardValidity>(() => {
    const currentYear = new Date().getFullYear();
    const next = {
      number: passesLuhn(number),
      holder: holder.trim().length >= 2,
      month: Number(month) >= 1 && Number(month) <= 12,
      year: Number(year) >= currentYear,
      cvv: /^\d{3,4}$/.test(cvv),
    };
    return { ...next, allValid: Object.values(next).every(Boolean) };
  }, [cvv, holder, month, number, year]);

  const state = useMemo(() => ({ number, holder, month, year, cvv }), [cvv, holder, month, number, year]);

  useEffect(() => {
    onChange?.(state, validity);
  }, [onChange, state, validity]);

  const displayNumber = Array.from({ length: 16 }, (_, index) => {
    if (!number[index]) return '#';
    return maskMiddle && index >= 4 && index <= 11 ? '*' : number[index];
  }).join('').replace(/(.{4})(?=.)/g, '$1 ');

  return (
    <section className={`ccp ${className}`}>
      <div className={`card ${focusField === 'cvv' ? 'flip' : ''}`}>
        <div className="card-face card-front" style={{ '--ring1': ring1, '--ring2': ring2 } as React.CSSProperties}>
          <div className="card-head"><span>CreditCard</span><span className="brand"><i /><i /></span></div>
          <div className={`card-number ${focusField === 'number' ? 'active' : ''}`}>{displayNumber}</div>
          <div className="card-foot">
            <div className={focusField === 'holder' ? 'active' : ''}><small>Card Holder</small><strong>{holder || 'NAME ON CARD'}</strong></div>
            <div className={focusField === 'expire' ? 'active' : ''}><small>Expires</small><strong>{month || 'MM'}/{year ? year.slice(-2) : 'YY'}</strong></div>
          </div>
        </div>
        <div className="card-face card-back" style={{ '--ring1': ring1, '--ring2': ring2 } as React.CSSProperties}>
          <div className="strip" /><small>CVV</small><div className="cvv-line">{'*'.repeat(cvv.length)}</div>
        </div>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); onSubmit?.(state, validity); }} noValidate>
        <label htmlFor="card-number">Card Number</label>
        <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={formatNumber(number)} onChange={(event) => setNumber(clampDigits(event.target.value, 19))} onFocus={() => setFocusField('number')} onBlur={() => setFocusField(null)} aria-invalid={number.length > 0 && !validity.number} />

        <label htmlFor="card-holder">Card Holder</label>
        <input id="card-holder" autoComplete="cc-name" placeholder="NAME ON CARD" value={holder} onChange={(event) => setHolder(event.target.value.toUpperCase())} onFocus={() => setFocusField('holder')} onBlur={() => setFocusField(null)} aria-invalid={holder.length > 0 && !validity.holder} />

        <div className="field-group">
          <div>
            <label htmlFor="expiration-month">Expiration Date</label>
            <div className="date-group">
              <select id="expiration-month" value={month} onChange={(event) => setMonth(event.target.value)} onFocus={() => setFocusField('expire')} onBlur={() => setFocusField(null)} aria-label="Expiration month">
                <option value="" disabled>Month</option>
                {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((value) => <option key={value}>{value}</option>)}
              </select>
              <select value={year} onChange={(event) => setYear(event.target.value)} onFocus={() => setFocusField('expire')} onBlur={() => setFocusField(null)} aria-label="Expiration year">
                <option value="" disabled>Year</option>
                {years.map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="card-cvv">CVV</label>
            <input id="card-cvv" inputMode="numeric" autoComplete="cc-csc" placeholder="***" value={cvv} onChange={(event) => setCVV(clampDigits(event.target.value, 4))} onFocus={() => setFocusField('cvv')} onBlur={() => setFocusField(null)} />
          </div>
        </div>

        {showSubmit ? <button type="submit" disabled={!validity.allValid}>{validity.allValid ? 'Continue' : 'Complete all fields'}</button> : null}
      </form>

      <style jsx>{`
        .ccp { width: 100%; color: #0f172a; }
        .card { position: relative; width: 238px; height: 132px; margin: 0 auto 12px; perspective: 900px; transform-style: preserve-3d; transition: transform .6s; }
        .card.flip { transform: rotateY(180deg); }
        .card-face { position: absolute; inset: 0; overflow: hidden; border-radius: 15px; padding: 14px 17px; color: white; background: linear-gradient(145deg, #172433, #071019); box-shadow: 0 15px 28px -15px rgba(15, 23, 42, .75); backface-visibility: hidden; }
        .card-face::before, .card-face::after { content: ''; position: absolute; width: 150px; height: 150px; border: 10px solid var(--ring1); border-radius: 999px; filter: blur(9px); opacity: .7; }
        .card-face::before { left: -80px; top: -65px; }
        .card-face::after { right: -90px; bottom: -105px; border-color: var(--ring2); }
        .card-head, .card-number, .card-foot, .strip, .card-back small, .cvv-line { position: relative; z-index: 1; }
        .card-head { display: flex; align-items: center; justify-content: space-between; font-size: 9px; font-weight: 700; }
        .brand { position: relative; display: flex; width: 27px; }
        .brand i { width: 18px; height: 18px; border-radius: 50%; background: #eb001b; }
        .brand i + i { margin-left: -8px; background: #f79e1b; opacity: .92; }
        .card-number { margin: 23px 0 17px; border: 1px solid transparent; border-radius: 6px; padding: 2px 3px; font-size: 13px; font-weight: 700; letter-spacing: 1.2px; }
        .active { border-color: rgba(255, 255, 255, .85) !important; box-shadow: 0 0 4px white; }
        .card-foot { display: flex; justify-content: space-between; gap: 8px; }
        .card-foot > div { min-width: 58px; border: 1px solid transparent; border-radius: 6px; padding: 2px 3px; }
        .card-foot small, .card-foot strong { display: block; }
        .card-foot small { font-size: 6px; text-transform: uppercase; opacity: .7; }
        .card-foot strong { max-width: 150px; overflow: hidden; font-size: 8px; white-space: nowrap; text-overflow: ellipsis; }
        .card-back { transform: rotateY(180deg); padding: 20px 0 0; }
        .strip { height: 25px; background: #64748b; }
        .card-back small { display: block; margin: 12px 18px 3px; text-align: right; font-size: 7px; }
        .cvv-line { height: 27px; margin: 0 18px; border-radius: 6px; background: white; padding: 5px 9px; text-align: right; color: #0f172a; }
        form { display: grid; gap: 5px; border: 1px solid #e2e8f0; border-radius: 13px; background: white; padding: 11px; box-shadow: 0 10px 30px rgba(15, 23, 42, .08); }
        label { display: block; margin-top: 1px; font-size: 8px; font-weight: 700; color: #334155; }
        input, select { width: 100%; height: 34px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; padding: 0 9px; outline: none; color: #0f172a; font-size: 10px; }
        input:focus, select:focus { border-color: #1769ff; box-shadow: 0 0 0 2px rgba(23, 105, 255, .12); }
        input[aria-invalid='true'] { border-color: #ef4444; }
        .field-group { display: grid; grid-template-columns: 2fr 1fr; gap: 7px; }
        .date-group { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        button { height: 38px; margin-top: 3px; border: 0; border-radius: 10px; background: #1769ff; color: white; font-size: 11px; font-weight: 800; box-shadow: 0 9px 18px -9px #1769ff; }
        button:disabled { cursor: not-allowed; opacity: .45; box-shadow: none; }
      `}</style>
    </section>
  );
}
