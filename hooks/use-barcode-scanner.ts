"use client";

import { useState, useCallback } from "react";

export type ScanState = "idle" | "scanning" | "loading" | "result" | "error";

export function useBarcodeScanner() {
  const [state, setState] = useState<ScanState>("idle");
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = useCallback(() => {
    setState("scanning");
    setError(null);
    setBarcode(null);
  }, []);

  const onScanSuccess = useCallback((code: string) => {
    setBarcode(code);
    setState("loading");
  }, []);

  const onScanError = useCallback((err: string) => {
    setError(err);
    setState("error");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setBarcode(null);
    setError(null);
  }, []);

  const setResultState = useCallback(() => {
    setState("result");
  }, []);

  return {
    state,
    barcode,
    error,
    startScanning,
    onScanSuccess,
    onScanError,
    reset,
    setResultState,
  };
}
