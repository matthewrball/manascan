"use client";

import { useState, useEffect } from "react";

export function useInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsStandalone(
      "standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone: boolean }).standalone ===
          true
    );
    setDismissed(localStorage.getItem("manascan-install-dismissed") === "true");
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("manascan-install-dismissed", "true");
  };

  return { isIOS, isStandalone, dismissed, dismiss };
}
