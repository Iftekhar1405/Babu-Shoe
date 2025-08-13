import { AuthGuard } from '@/components/auth/AuthGuard';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </AuthGuard>
  );
}