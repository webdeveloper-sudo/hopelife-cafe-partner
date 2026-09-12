import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download HOPE Hub App | Official Android APK",
  description: "Download the official HOPE Hub Android application. Conveniently manage guest passes, track referral earnings, and monitor payouts on your mobile device.",
  openGraph: {
    title: "Download HOPE Hub App | Official Android APK",
    description: "Take HOPE Hub with you. Official Android APK download for HOPE Cafe partners.",
    images: ["/logo.png"],
  },
};

export default function DownloadAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
