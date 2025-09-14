'use client';

import AppSidebar from '@/components/AppSidebar';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar />
      {children}
    </>
  );
}
