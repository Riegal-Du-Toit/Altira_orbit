import { OrbitApplication } from '@/components/orbit/orbit-application';
import { IPhone } from '@/components/ui/iphone';

export function HomeAutoDemo() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-3 sm:p-6">
      <IPhone>
        <OrbitApplication />
      </IPhone>
    </main>
  );
}
