export const MAX_SITE_PHOTOS = 8;
export const MAX_SITE_PHOTO_SOURCE_BYTES = 12 * 1024 * 1024;
export const MAX_SITE_PHOTO_DATA_URL_LENGTH = 750_000;

const ALLOWED_SITE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface SitePhotoAttachment {
  id: string;
  name: string;
  type: 'image/jpeg';
  sizeBytes: number;
  sizeLabel: string;
  dataUrl: string;
  shotType?: string;
  shotLabel?: string;
  captureMethod?: 'UPLOAD' | 'MOBILE_CAMERA' | 'LIVE_CAMERA';
  capturedAt?: string;
}

export type SitePhotoMetadata = Pick<
  SitePhotoAttachment,
  'shotType' | 'shotLabel' | 'captureMethod' | 'capturedAt'
>;

export interface SiteCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read this photo.'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be opened.'));
    image.src = url;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare this photo.'))),
      'image/jpeg',
      quality
    );
  });
}

export function formatSitePhotoSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function prepareSitePhoto(file: File, metadata: SitePhotoMetadata = {}): Promise<SitePhotoAttachment> {
  if (!ALLOWED_SITE_PHOTO_TYPES.has(file.type)) {
    throw new Error('Use a JPG, PNG or WebP image.');
  }
  if (file.size > MAX_SITE_PHOTO_SOURCE_BYTES) {
    throw new Error('Each photo must be smaller than 12 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo processing is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let compressed = await canvasToJpeg(canvas, 0.76);
    if (compressed.size > 500_000) compressed = await canvasToJpeg(canvas, 0.56);
    const dataUrl = await readBlobAsDataUrl(compressed);
    if (dataUrl.length > MAX_SITE_PHOTO_DATA_URL_LENGTH) {
      throw new Error('This photo is still too large after compression. Please choose a smaller image.');
    }

    const baseName = file.name.replace(/\.[^.]+$/, '').slice(0, 80) || 'site-photo';
    return {
      id: globalThis.crypto?.randomUUID?.() || `site-photo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: `${baseName}.jpg`,
      type: 'image/jpeg',
      sizeBytes: compressed.size,
      sizeLabel: formatSitePhotoSize(compressed.size),
      dataUrl,
      shotType: metadata.shotType?.slice(0, 60),
      shotLabel: metadata.shotLabel?.slice(0, 100),
      captureMethod: metadata.captureMethod ?? 'UPLOAD',
      capturedAt: metadata.capturedAt ?? new Date().toISOString(),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function isSafeSitePhotoDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(?:jpeg|png|webp);base64,/i.test(value);
}
