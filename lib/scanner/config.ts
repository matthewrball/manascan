/** Native BarcodeDetector formats for food products */
export const BARCODE_FORMATS: BarcodeFormat[] = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
];

/** Milliseconds between detect() calls (~7 scans/sec) */
export const SCAN_INTERVAL_MS = 150;

/** Ignore duplicate barcode scans within this window */
export const DUPLICATE_COOLDOWN_MS = 5000;

/** Camera constraints — 720p is sufficient for barcodes and lighter on processing */
export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};
