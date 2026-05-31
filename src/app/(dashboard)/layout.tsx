import { Sidebar } from '@widgets/sidebar';
import { Header } from '@widgets/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-6 pb-6 pt-6">{children}</main>
      </div>
    </div>
  );
}
