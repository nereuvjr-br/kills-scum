import Link from 'next/link';
import { Users, Shield, ArrowLeft } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Administração
              </h1>
            </div>
            
            <nav className="flex items-center gap-2">
              <Link
                href="/admin/clans"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                Clãs
              </Link>
              <Link
                href="/admin/players"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                Players
              </Link>
              <Link
                href="/admin/import"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                Importar
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
}
