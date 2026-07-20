import React, { useEffect, useMemo, useRef } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, onComplete, disabled = false }) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastCompletedValue = useRef('');

  const digits = useMemo(() => {
    return Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || '');
  }, [value]);

  useEffect(() => {
    if (value.length === OTP_LENGTH && onComplete && value !== lastCompletedValue.current) {
      lastCompletedValue.current = value;
      onComplete(value);
      return;
    }

    if (value.length < OTP_LENGTH) {
      lastCompletedValue.current = '';
    }
  }, [value, onComplete]);

  const focusIndex = (index: number) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const updateValue = (index: number, inputValue: string) => {
    if (disabled) return;

    const cleaned = inputValue.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (cleaned.length > 1) {
      cleaned.split('').slice(0, OTP_LENGTH - index).forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
    } else {
      nextDigits[index] = cleaned.slice(-1);
    }

    const nextValue = nextDigits.join('').slice(0, OTP_LENGTH);
    onChange(nextValue);

    if (cleaned && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    onChange(pasted);

    const nextIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    focusIndex(nextIndex);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={element => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          value={digit}
          disabled={disabled}
          onChange={event => updateValue(index, event.target.value)}
          onKeyDown={event => handleKeyDown(index, event)}
          onPaste={handlePaste}
          maxLength={OTP_LENGTH}
          className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-800/80 border border-slate-600 text-center text-xl font-bold text-white outline-none transition-all focus:border-secondary-green focus:ring-2 focus:ring-secondary-green/40 disabled:opacity-60"
        />
      ))}
    </div>
  );
};

export default OTPInput;
