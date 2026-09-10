'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type SwipeConfirmButtonProps = {
  disabled?: boolean;
  onConfirm: () => void;
};

export function SwipeConfirmButton({ disabled = false, onConfirm }: SwipeConfirmButtonProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const timer = useRef<number | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const maximumX = useRef(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || confirmed) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startX.current = event.clientX - currentX.current;
    maximumX.current = Math.max(0, (buttonRef.current?.clientWidth ?? 0) - (handRef.current?.clientWidth ?? 0) - 10);
    setDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled || confirmed) return;
    const nextX = Math.min(maximumX.current, Math.max(0, event.clientX - startX.current));
    currentX.current = nextX;
    setDragX(nextX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled || confirmed) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (maximumX.current > 0 && currentX.current >= maximumX.current * 0.72) {
      setConfirmed(true);
      timer.current = window.setTimeout(onConfirm, 1500);
      return;
    }
    currentX.current = 0;
    setDragX(0);
  };

  const cancelDrag = () => {
    if (confirmed) return;
    setDragging(false);
    currentX.current = 0;
    setDragX(0);
  };

  return (
    <label id="Container" aria-disabled={disabled} onClick={(event) => event.preventDefault()}>
      <input
        type="checkbox"
        id="checkbox"
        checked={confirmed}
        disabled={disabled}
        readOnly
      />
      <div id="buttonOutBorder">
        <div className="fx" />
        <div className="fx bottom" />
        <div id="button" ref={buttonRef}>
          <div id="buttonText" />
          <div
            id="buttonHand"
            ref={handRef}
            role="slider"
            aria-label="Swipe to confirm"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={confirmed ? 100 : Math.round((dragX / Math.max(maximumX.current, 1)) * 100)}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={cancelDrag}
            style={confirmed ? undefined : { transform: `translateX(${dragX}px) rotate(${Math.round(dragX * 1.5)}deg)`, transition: dragging ? 'none' : undefined }}
          >
            <svg className="svg svgLocked" xmlns="http://www.w3.org/2000/svg" width="24" height="29" viewBox="0 0 24 29" fill="none" stroke="#1769ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 5 5-5 5" />
              <path d="m13 9 5 5-5 5" />
            </svg>
            <svg className="svg svgUnlocked" xmlns="http://www.w3.org/2000/svg" width="24" height="29" viewBox="0 0 24 29" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 15 4 4L19 9" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        #Container {
          --button-width: 14.4rem;
          --button-hight: 3.6rem;
          --animation-duration: 700ms;
          --green-100: #d7f5e6;
          --green-200: #b2ebce;
          --green-300: #8de1b5;
          --green-400: #67d69d;
          --green-500: #3fc079;
          --green-600: #36a96b;
          --green-700: #2e915d;
          --green-800: #25794f;
          --green-900: #1d6140;
          --green-1000: #154932;
          display: flex;
          width: 100%;
          justify-content: center;
          padding: 1rem 0 1.5rem;
          cursor: pointer;
        }
        #Container[aria-disabled='true'] { cursor: not-allowed; opacity: .45; }
        .fx { content: ''; background-repeat: no-repeat; position: absolute; height: 100%; left: 50%; transform: translateX(-50%); width: 120%; filter: blur(.1rem); }
        #buttonHand:hover { transform: translateX(20%); }
        #checkbox:checked ~ #buttonOutBorder #button #buttonHand {
          animation: swipe var(--animation-duration) cubic-bezier(.19, 1, .22, 1) alternate;
          transform: translateX(calc(var(--button-width) - var(--button-hight) - .6rem)) rotate(360deg);
          background-color: #d5dbe1;
          box-shadow: inset 0 -.1rem .2rem #d5dbe1, inset 0 -.1rem .2rem #d5dbe1, inset 0 .7rem .6rem #fff, inset 0 .8rem .3rem #d5dbe1, inset 0 -.1rem .7rem .05rem #3fc079;
        }
        #checkbox:checked ~ #buttonOutBorder #button {
          background-color: #3fc079;
          box-shadow: inset 0 .5rem .5rem #0003, inset 0 .5rem .5rem #3fc079, inset .5rem 1rem .7rem #fff9, inset 0 -.2rem 1rem #fff9, 0 1rem 2rem #0003;
        }
        #checkbox:checked ~ #buttonOutBorder .bottom { transform: scale(-1) translateY(-170%) translateX(40%); }
        #checkbox:checked ~ #buttonOutBorder .fx {
          background-image: radial-gradient(circle, var(--green-500) 10%, transparent 10%), radial-gradient(circle, var(--green-200) 15%, transparent 15%), radial-gradient(circle, var(--green-300) 22%, transparent 22%), radial-gradient(circle, var(--green-900) 10%, transparent 22%), radial-gradient(circle, var(--green-700) 15%, transparent 15%), radial-gradient(circle, var(--green-500) 20%, transparent 20%), radial-gradient(circle, var(--green-400) 22%, transparent 22%), radial-gradient(circle, var(--green-400) 10%, transparent 10%), radial-gradient(circle, var(--green-300) 22%, transparent 22%), radial-gradient(circle, var(--green-1000) 10%, transparent 10%), radial-gradient(circle, var(--green-1000) 15%, transparent 15%);
          background-size: 15% 15%, 25% 25%, 20% 20%, 25% 25%, 18% 18%, 18% 18%, 15% 15%, 22% 22%, 15% 15%, 25% 25%, 20% 20%;
          background-position: 50% 125%;
          animation: bubblesAnimation var(--animation-duration) ease 400ms;
          top: -80%;
        }
        #checkbox:checked ~ #buttonOutBorder::after { background: rgba(63, 192, 121, .5); animation: swipe-border var(--animation-duration) cubic-bezier(.19, 1, .22, 1) alternate; }
        #checkbox:checked ~ #buttonOutBorder::before { box-shadow: 0 0 1rem .1rem #3fc079, inset 0 0 1rem .1rem #3fc079; animation: wave-border calc(var(--animation-duration) + 200ms) ease infinite 300ms; }
        #checkbox:checked ~ #buttonOutBorder { box-shadow: 0 0 5rem 1rem #3fc07999; animation: swipe-button var(--animation-duration) cubic-bezier(.19, 1, .22, 1) alternate, shadow-border calc(var(--animation-duration) + 200ms) ease alternate infinite 600ms; }
        #button {
          z-index: 10;
          transition: all var(--animation-duration) ease 300ms;
          position: relative;
          background-color: #1769ff;
          padding: .1rem;
          box-shadow: inset 0 .5rem .5rem #0848c966, inset .5rem 1rem .7rem #ffffff55, inset 0 -.2rem 1rem #ffffff44, 0 1rem 2rem #1769ff55;
          border-radius: var(--button-hight);
          width: var(--button-width);
        }
        #buttonOutBorder { position: relative; width: var(--button-width); border-radius: var(--button-hight); transition: all var(--animation-duration) ease 300ms; box-shadow: 0 1rem 2rem #1769ff66, 0 0 1rem #1769ff44; z-index: 1; }
        #buttonOutBorder::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: .2rem; width: 100%; height: 100%; background: rgba(23, 105, 255, .28); border-radius: var(--button-hight); box-shadow: inset .5rem -1rem .7rem #ffffff66; backdrop-filter: blur(.1rem); transition: all var(--animation-duration) ease 300ms; z-index: 2; }
        #buttonOutBorder::before { z-index: 0; content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: .2rem; width: 100%; height: 100%; filter: blur(.25rem); border-radius: var(--button-hight); transition: all var(--animation-duration) ease 300ms; }
        #buttonHand {
          transition: all var(--animation-duration) cubic-bezier(.19, 1, .22, 1);
          transform: translateX(0) rotate(0);
          position: relative;
          background-color: #eef5ff;
          display: flex;
          justify-content: center;
          align-items: center;
          width: var(--button-hight);
          height: var(--button-hight);
          border-radius: 50%;
          margin: .3rem .3rem .3rem .2rem;
          box-shadow: inset 2px 5px 5px -2px #0003, inset 0 .7rem .6rem #fff, inset -.01rem -.1rem 0 #fff9, 2px 5px 5px 0 #0001;
          overflow: hidden;
          cursor: grab;
          touch-action: none;
          user-select: none;
        }
        #buttonHand:active { cursor: grabbing; }
        #buttonHand .svg { transform: scale(1.2); }
        #buttonHand::before { content: ''; position: absolute; top: -90%; left: -210%; width: 200%; height: 200%; opacity: 0; transform: rotate(30deg); background: linear-gradient(to right, rgba(255,255,255,.13) 0%, rgba(255,255,255,.13) 77%, rgba(255,255,255,.5) 92%, rgba(255,255,255,0) 100%); }
        #buttonHand:hover::before { opacity: 1; top: 0; left: -30%; transition-property: left, top, opacity; transition-duration: .7s, .7s, .15s; transition-timing-function: ease; }
        #buttonText::before { content: 'Swipe to verify'; position: absolute; top: 50%; left: 57%; transform: translate(-50%, -50%); text-align: center; white-space: nowrap; color: #ffffffe8; font-weight: 700; transition: all 300ms ease 300ms; }
        #buttonText::after { content: 'Success'; position: absolute; top: 50%; left: 50%; transform: translate(-150%, -50%); text-align: center; white-space: nowrap; color: #fff; font-weight: 700; transition: all 300ms ease 100ms; opacity: 0; }
        #checkbox:checked ~ #buttonOutBorder #button #buttonText::before { transform: translate(100%, -50%); opacity: 0; }
        #checkbox:checked ~ #buttonOutBorder #button #buttonText::after { transition: all 300ms ease 300ms; transform: translate(-50%, -50%); opacity: 1; }
        #checkbox { display: none; }
        .svgLocked { display: block; }
        .svgUnlocked { display: none; }
        #checkbox:checked ~ #buttonOutBorder #button .svgUnlocked { display: block; }
        #checkbox:checked ~ #buttonOutBorder #button .svgLocked { display: none; }
        @keyframes swipe {
          0% { transform: translateX(0) rotate(0); }
          30% { transform: translateX(-2rem) rotate(-30deg) scaleY(.7); }
          80% { transform: translateX(calc(var(--button-width) - var(--button-hight) - .6rem + 1rem)) rotate(390deg) scaleY(.9); }
          100% { transform: translateX(calc(var(--button-width) - var(--button-hight) - .6rem)) rotate(360deg); }
        }
        @keyframes swipe-border {
          0% { width: 100%; transform: translate(-50%, -50%); }
          30% { width: 105%; transform: translate(-58%, -50%); }
          45% { width: 100%; transform: translate(-50%, -50%); }
          80% { width: 105%; transform: translate(-48%, -50%); }
          100% { width: 100%; transform: translate(-50%, -50%); }
        }
        @keyframes swipe-button {
          0% { transform: none; }
          30% { transform: translateX(-7%) translateY(10%) scaleY(.8) rotate(-3deg); }
          80% { transform: translateX(3%) translateY(-7%) scaleY(.9) rotate(2deg); }
          100% { transform: none; }
        }
        @keyframes bubblesAnimation {
          0% { background-position: 10% 95%, 15% 95%, 15% 95%, 20% 95%, 30% 95%, 30% 95%, 45% 95%, 65% 95%, 75% 95%, 10% 95%, 15% 95%, 15% 95%; }
          70% { background-position: 5% 85%, 5% 25%, 15% 45%, 25% 5%, 35% 35%, 27% 55%, 55% 55%, 75% 25%, 95% 35%, 5% 85%, 15% 45%; }
          100% { background-position: 5% 75%, 5% 15%, 15% 35%, 25% 0%, 35% 25%, 27% 45%, 55% 45%, 70% 15%, 95% 25%, 5% 75%, 15% 35%; background-size: 0 0; }
        }
        @keyframes wave-border { 0% { width: 75%; height: 75%; opacity: 1; } 100% { width: 150%; height: 150%; opacity: 0; } }
        @keyframes shadow-border { 0% { box-shadow: 0 0 5rem 1rem #3fc07999; } 100% { box-shadow: 0 0 10rem 5rem #3fc07999; } }
      `}</style>
    </label>
  );
}
