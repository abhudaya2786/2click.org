export interface NormalizedLocation {
  pincode: string;
  city: string;
  district: string;
  stateRegion: string;
  country: string;
}

export function normalizeIndianPincode(value: string): string {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

export function normalizeIndianLocation(input: {
  pincode: string;
  city: string;
  district?: string;
  stateRegion: string;
  country?: string;
}): NormalizedLocation {
  const pincode = normalizeIndianPincode(input.pincode);
  const city = input.city.trim();
  const district = (input.district || input.city).trim();
  const stateRegion = input.stateRegion.trim();
  const country = (input.country || 'India').trim();

  return { pincode, city, district, stateRegion, country };
}
