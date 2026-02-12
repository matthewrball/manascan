"use client";

import { useEffect, useRef } from "react";
import {
  BARCODE_FORMATS,
  SCAN_INTERVAL_MS,
  DUPLICATE_COOLDOWN_MS,
  CAMERA_CONSTRAINTS,
} from "@/lib/scanner/config";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: string) => void;
  active: boolean;
}

export default function BarcodeScanner({
  onScan,
  onError,
  active,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(active);
  const lastScanRef = useRef("");
  const lastScanTimeRef = useRef(0);

  // Store callbacks in refs so the effect never re-runs due to prop changes
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;
  activeRef.current = active;

  useEffect(() => {
    let mounted = true;

    const handleDetection = (rawValue: string) => {
      const now = Date.now();
      if (
        rawValue === lastScanRef.current &&
        now - lastScanTimeRef.current < DUPLICATE_COOLDOWN_MS
      ) {
        return;
      }
      lastScanRef.current = rawValue;
      lastScanTimeRef.current = now;

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      onScanRef.current(rawValue);
    };

    const startScanLoop = (
      video: HTMLVideoElement,
      detector: BarcodeDetector
    ) => {
      const tick = async () => {
        if (!mounted) return;

        if (!activeRef.current) {
          timerRef.current = setTimeout(tick, SCAN_INTERVAL_MS);
          return;
        }

        if (video.readyState >= 2) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0) {
              handleDetection(barcodes[0].rawValue);
            }
          } catch {
            // detect() can throw on dropped frames — ignore
          }
        }

        timerRef.current = setTimeout(tick, SCAN_INTERVAL_MS);
      };

      tick();
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onErrorRef.current(
          `getUserMedia not available. Protocol: ${location.protocol}, Secure: ${window.isSecureContext}`
        );
        return;
      }

      // Acquire camera stream
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      } catch (err) {
        if (!mounted) return;
        const e = err as DOMException;
        onErrorRef.current(
          `${e.name}: ${e.message} [protocol=${location.protocol}, secure=${window.isSecureContext}]`
        );
        return;
      }

      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      // iOS Safari requires an explicit play() call
      try {
        await video.play();
      } catch {
        // play() can reject if interrupted — video may still play via autoPlay
      }

      // Use native BarcodeDetector, or polyfill if not available
      let DetectorClass = window.BarcodeDetector;
      if (!DetectorClass) {
        try {
          const mod = await import("barcode-detector");
          DetectorClass = mod.BarcodeDetector;
        } catch {
          onErrorRef.current("Barcode detection not supported on this device");
          return;
        }
      }

      if (!mounted) return;

      try {
        const detector = new DetectorClass({ formats: BARCODE_FORMATS });
        detectorRef.current = detector;

        // Start scan loop once video has data
        if (video.readyState >= 2) {
          startScanLoop(video, detector);
        } else {
          video.addEventListener(
            "loadeddata",
            () => {
              if (mounted) startScanLoop(video, detector);
            },
            { once: true }
          );
        }
      } catch (err) {
        if (!mounted) return;
        const message =
          err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        onErrorRef.current(message);
      }
    };

    start();

    return () => {
      mounted = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      detectorRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
    </div>
  );
}
