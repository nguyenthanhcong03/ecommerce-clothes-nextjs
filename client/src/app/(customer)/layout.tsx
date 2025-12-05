import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='w-full'>
      <Header />
      <main className='mt-14 min-h-screen bg-gray-50 lg:mt-20'>{children}</main>
      <Footer />
    </div>
  );
}
