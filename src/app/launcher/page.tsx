"use client";

import dynamic from "next/dynamic";

const AppLauncher = dynamic(() => import("@/app/auth/AppLauncher"), { ssr: false });

export default function LauncherRoute() {
  return <AppLauncher />;
}
