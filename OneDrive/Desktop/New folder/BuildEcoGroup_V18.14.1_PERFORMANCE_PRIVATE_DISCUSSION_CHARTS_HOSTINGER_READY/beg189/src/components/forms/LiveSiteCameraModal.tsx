import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface LiveSiteCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => Promise<void> | void;
  shotLabel: string;
}

export const LiveSiteCameraModal: React.FC<LiveSiteCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  shotLabel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error' | 'saving'>('idle');
  const [message, setMessage] = useState('');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStatus('idle');
      setMessage('');
      return;
    }

    let cancelled = false;
    const startCamera = async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setMessage('Live camera needs a secure HTTPS connection and a supported browser. Use mobile camera or upload instead.');
        return;
      }

      setStatus('loading');
      setMessage('Waiting for camera permission…');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('ready');
        setMessage('Camera is ready. Keep the phone steady and include the full selected angle.');
      } catch (error) {
        const name = error instanceof DOMException ? error.name : '';
        setStatus('error');
        setMessage(
          name === 'NotAllowedError'
            ? 'Camera permission was not allowed. You can still use mobile camera or upload a photo.'
            : 'Camera could not start. Check browser permission or use mobile camera / upload.'
        );
      }
    };

    void startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen]);

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || status !== 'ready' || !video.videoWidth || !video.videoHeight) return;
    setStatus('saving');
    const canvas = document.createElement('canvas');
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      setStatus('error');
      setMessage('This browser could not prepare the captured frame.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.84));
    if (!blob) {
      setStatus('error');
      setMessage('The photo could not be captured. Please try again.');
      return;
    }
    const file = new File([blob], `live-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await onCapture(file);
    stopCamera();
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Live site camera"
      description={`Selected angle: ${shotLabel}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-[#191C1A] aspect-[4/3]">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-label={`Live camera preview for ${shotLabel}`}
            className="h-full w-full object-cover"
          />
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#191C1A]/80 text-white">
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
              <span className="text-sm font-semibold">Requesting camera permission…</span>
            </div>
          )}
          {(status === 'idle' || status === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
              {status === 'error' ? <AlertCircle className="h-8 w-8 text-[#FCA5A5]" /> : <Camera className="h-8 w-8" />}
              <span className="max-w-sm text-sm">{message || 'Camera preview will appear here.'}</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[var(--color-primary-subtle)] p-3 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
          <p>Camera starts only after permission. The live stream is not uploaded; only the photo you capture is attached.</p>
        </div>

        {status !== 'error' && message && <p role="status" className="text-xs text-[var(--color-text-muted)]">{message}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void captureFrame()}
            disabled={status !== 'ready'}
            leftIcon={status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          >
            {status === 'saving' ? 'Saving photo…' : 'Capture photo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
