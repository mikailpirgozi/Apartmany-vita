import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { BookingDetailClient } from '@/components/account/booking-detail-client';

export const metadata = {
  title: 'Detail rezervácie - Apartmány Vita',
  description: 'Detail vašej rezervácie apartmánu'
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/account/bookings');
  }

  const { id } = await params;

  return <BookingDetailClient bookingId={id} userId={session.user.id} />;
}

