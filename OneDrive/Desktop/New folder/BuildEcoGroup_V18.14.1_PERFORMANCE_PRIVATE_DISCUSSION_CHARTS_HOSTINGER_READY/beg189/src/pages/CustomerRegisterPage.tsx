import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  UserPlus,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import {
  CustomerRegistrationSchema,
  firstZodFieldMessage,
} from '../types/auth';
import { usePincodeLookup } from '../hooks/usePincodeLookup';
import { getDashboardRouteForRole } from '../lib/permissions';
import { captureProductEvent, PRODUCT_EVENTS } from '../lib/analytics';

export const CustomerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    registerCustomer,
    loginWithGoogle,
    googleRegistrationIdentity,
    error: authError,
    clearError,
  } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('India');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const pincodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { status: pincodeStatus, error: pincodeError, lookup, result } = usePincodeLookup();

  useEffect(() => {
    if (googleRegistrationIdentity) {
      setEmail(googleRegistrationIdentity.email);
      if (googleRegistrationIdentity.displayName) setFullName(googleRegistrationIdentity.displayName);
    }
  }, [googleRegistrationIdentity]);

  useEffect(() => {
    if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
    const cleaned = pincode.replace(/\D/g, '');
    if (cleaned.length !== 6) return;

    pincodeTimerRef.current = setTimeout(() => {
      lookup(cleaned).then((loc) => {
        if (loc) {
          setCity(loc.city);
          setDistrict(loc.district);
          setStateRegion(loc.state);
          setCountry(loc.country);
        }
      });
    }, 350);

    return () => {
      if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
    };
  }, [pincode, lookup]);

  const handleGoogleSignup = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);
    captureProductEvent(PRODUCT_EVENTS.REGISTRATION_STARTED, { signup_method: 'google' });
    try {
      const res = await loginWithGoogle('register');
      if (!res.redirecting && !res.success) {
        setLocalError(res.error || 'Google sign-up could not be started.');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Google sign-up failed.';
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoHint('Geolocation is not supported. Enter pincode manually.');
      return;
    }
    setGeoHint(null);
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/geolocation/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          if (!res.ok || !data.success) {
            setGeoHint('Could not resolve location. Enter pincode manually.');
            return;
          }
          if (data.city) setCity(data.city);
          if (data.district) setDistrict(data.district);
          if (data.state) setStateRegion(data.state);
          if (data.country) setCountry(data.country);
          if (data.pincode) setPincode(String(data.pincode).replace(/\D/g, '').slice(0, 6));
          setGeoHint('Location detected. You can edit the fields below.');
        } catch {
          setGeoHint('Could not resolve location. Enter pincode manually.');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoHint('Location permission denied. Enter pincode manually.');
        setGeoLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!googleRegistrationIdentity) {
      const partial = CustomerRegistrationSchema.safeParse({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: '9876543210',
        pincode: '560001',
        city: 'Placeholder',
        district: 'Placeholder',
        stateRegion: 'Placeholder',
        country: 'India',
        termsAccepted: true,
        privacyAccepted: true,
      });
      if (!partial.success) {
        const pwdError = partial.error.flatten().fieldErrors.password?.[0]
          || partial.error.flatten().fieldErrors.confirmPassword?.[0]
          || partial.error.flatten().fieldErrors.email?.[0]
          || partial.error.flatten().fieldErrors.fullName?.[0];
        if (pwdError) return pwdError;
      }
    }
    return null;
  };

  const validateStep2 = () => {
    const parsed = CustomerRegistrationSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
      password: googleRegistrationIdentity ? '' : password,
      confirmPassword: googleRegistrationIdentity ? '' : confirmPassword,
      phone: phone.trim(),
      pincode: pincode.trim(),
      city: city.trim(),
      district: district.trim() || city.trim(),
      stateRegion: stateRegion.trim(),
      country,
      termsAccepted,
      privacyAccepted,
      idToken: googleRegistrationIdentity?.idToken,
    });
    if (!parsed.success) return firstZodFieldMessage(parsed.error);
    return null;
  };

  const handleSubmit = async () => {
    const err = validateStep2();
    if (err) {
      setLocalError(err);
      captureProductEvent(PRODUCT_EVENTS.REGISTRATION_FAILED, { error_code: 'VALIDATION_FAILED' });
      return;
    }
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const res = await registerCustomer({
        fullName: fullName.trim(),
        email: email.trim(),
        password: googleRegistrationIdentity ? '' : password,
        confirmPassword: googleRegistrationIdentity ? '' : confirmPassword,
        phone: phone.trim(),
        pincode: pincode.trim(),
        city: city.trim(),
        district: district.trim() || city.trim(),
        stateRegion: stateRegion.trim(),
        country,
        termsAccepted,
        privacyAccepted,
      });
      if (res.success && res.user) {
        captureProductEvent(PRODUCT_EVENTS.REGISTRATION_SUCCEEDED, { signup_method: googleRegistrationIdentity ? 'google' : 'email' });
        navigate(getDashboardRouteForRole(res.user.role), { replace: true });
      } else {
        captureProductEvent(PRODUCT_EVENTS.REGISTRATION_FAILED, { error_code: 'REGISTRATION_FAILED' });
        setLocalError(res.error || 'Registration failed.');
      }
    } catch (e: unknown) {
      captureProductEvent(PRODUCT_EVENTS.REGISTRATION_FAILED, { error_code: 'REGISTRATION_EXCEPTION' });
      const message = e instanceof Error ? e.message : 'Registration failed.';
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <div className="text-center">
        <Badge variant="primary" size="md" icon={<UserPlus className="h-3.5 w-3.5" />}>
          Create Account
        </Badge>
        <h1 className="mt-3 text-2xl font-extrabold text-[var(--color-text)]">Join BuildEcoGroup</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Minimal signup — choose your service categories from the dashboard after registration.
        </p>
      </div>

      {displayError && (
        <div className="flex items-start gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-sm text-[#DC2626]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <Card className="p-5 sm:p-6 space-y-5">
        {step === 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
              leftIcon={<Mail className="h-4 w-4" />}
            >
              Continue with Google
            </Button>
            <div className="relative text-center text-xs text-[var(--color-text-subtle)]">
              <span className="bg-[var(--color-surface)] px-2">or email signup</span>
            </div>
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!googleRegistrationIdentity} />
            {!googleRegistrationIdentity && (
              <>
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </>
            )}
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => {
                const err = validateStep1();
                if (err) setLocalError(err);
                else {
                  setLocalError(null);
                  captureProductEvent(PRODUCT_EVENTS.REGISTRATION_STARTED, { signup_method: 'email' });
                  setStep(2);
                }
              }}
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input label="Mobile Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} leftIcon={<Phone className="h-4 w-4" />} required />
            <div>
              <Input
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                leftIcon={<MapPin className="h-4 w-4" />}
                required
              />
              {pincodeStatus === 'loading' && <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Looking up pincode...</p>}
              {pincodeStatus === 'success' && result && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {result.district}, {result.state}, {result.country}
                </p>
              )}
              {pincodeError && <p className="mt-1 text-[11px] text-amber-700">{pincodeError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
            <Input label="State" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} required />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={useCurrentLocation}
              disabled={geoLoading}
              leftIcon={<Navigation className="h-4 w-4" />}
            >
              {geoLoading ? 'Detecting...' : 'Use current location (optional)'}
            </Button>
            {geoHint && (
              <p className="text-[11px] text-[var(--color-text-muted)]">{geoHint}</p>
            )}
            <label className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
              <span>I accept the <Link to={ROUTES.ABOUT} className="text-[var(--color-primary)] underline">Terms of Service</Link></span>
            </label>
            <label className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
              <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="mt-0.5" />
              <span>I accept the Privacy Policy and consent to data processing</span>
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button type="button" variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="flex-1" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </>
        )}
      </Card>

      <div className="space-y-2 text-center text-sm text-[var(--color-text-muted)]">
        <p>
          Already have an account? <Link to={ROUTES.LOGIN} className="font-bold text-[var(--color-primary)]">Sign in</Link>
        </p>
        <p className="text-xs">
          Cannot access your account?{' '}
          <Link to={`${ROUTES.LOGIN}?forgot=1`} className="font-bold text-[var(--color-primary)] hover:underline">
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
};
