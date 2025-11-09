import { ReactNode } from 'react';

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
