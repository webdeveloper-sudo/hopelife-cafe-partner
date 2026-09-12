"use client";

import { useEffect } from "react";

/**
 * CapacitorBridge
 * Handles native mobile bridge events (e.g. Android Back Button, Status Bar, Splash Screen)
 * safely in the client browser only when running in a native Capacitor container.
 */
export default function CapacitorBridge() {
  useEffect(() => {
    // Only execute in browser environment
    if (typeof window === "undefined") return;

    let cleanup = () => {};

    const initCapacitor = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        // Native platform detected: Configure status bar, splash screen, and back button
        const { App } = await import("@capacitor/app");
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        // Set status bar color and style
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: "#5D2E8C" });
        } catch (e) {
          // Non-fatal if status bar config is not supported on specific device
        }

        // Hide splash screen smoothly after load
        try {
          await SplashScreen.hide({ fadeOutDuration: 500 });
        } catch (e) {
          // Ignore
        }

        // Handle Android hardware back button
        const backButtonListener = await App.addListener("backButton", ({ canGoBack }) => {
          const pathname = window.location.pathname;
          const isRootOrDashboard =
            pathname === "/" ||
            pathname === "/dashboard" ||
            pathname === "/admin/dashboard" ||
            pathname === "/super-admin/dashboard" ||
            pathname === "/marketing/dashboard";

          if (canGoBack && !isRootOrDashboard) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });

        cleanup = () => {
          backButtonListener.remove();
        };
      } catch (err) {
        // Safe catch: on web browsers, Capacitor dynamic imports gracefully fail or do nothing
      }
    };

    initCapacitor();

    return () => {
      cleanup();
    };
  }, []);

  return null;
}
