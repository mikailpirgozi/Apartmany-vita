import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { BookingsPageClient } from '@/components/account/bookings-page-client';

export const metadata = {
  title: 'Moje rezervácie - Apartmány Vita',
  description: 'Prehľad všetkých vašich rezervácií apartmánov'
};

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/account/bookings');
  }

  return <BookingsPageClient />;
}

