import { useState, useCallback, useRef } from 'react';

export interface PincodeResult {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

export function usePincodeLookup() {
  const [status, setStatus] = useState<LookupStatus>('idle');
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ code: string; result: PincodeResult } | null>(null);

  const lookup = useCallback(async (pincode: string): Promise<PincodeResult | null> => {
    const cleaned = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) {
      setStatus('idle');
      setResult(null);
      setError(null);
      cacheRef.current = null;
      return null;
    }

    if (cacheRef.current?.code === cleaned) {
      setResult(cacheRef.current.result);
      setStatus('success');
      setError(null);
      return cacheRef.current.result;
    }

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`/api/pincode/${cleaned}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pincode lookup failed');
      }
      const loc: PincodeResult = {
        pincode: cleaned,
        city: data.city,
        district: data.district || data.city,
        state: data.state,
        country: data.country || 'India',
      };
      cacheRef.current = { code: cleaned, result: loc };
      setResult(loc);
      setStatus('success');
      return loc;
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'Could not resolve pincode. Enter city/state manually.';
      setStatus('error');
      setError(message);
      setResult(null);
      cacheRef.current = null;
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    cacheRef.current = null;
  }, []);

  return { status, result, error, lookup, reset };
}
