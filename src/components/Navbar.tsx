'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, Home, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-800">Termómetro</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="text-slate-500">
          <UserIcon className="w-6 h-6" />
        </Link>
        <button onClick={() => signOut()} className="text-slate-400">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
