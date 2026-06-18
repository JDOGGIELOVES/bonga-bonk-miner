'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/free-grok-tools', label: 'Free Tools' },
  { href: '/best-grok-prompts', label: 'Best Prompts' },
  { href: '/best-grok-image-prompts', label: 'Image Prompts' },
  { href: '/comparisons', label: 'Comparisons' },
  { href: '/categories', label: 'Categories' },
  { href: '/blog', label: 'Blog' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-black hover:underline">
          Grok Searcher
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-black transition ${
                pathname === link.href ? 'text-black font-semibold' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://grok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Open Grok
          </a>
          {/* Mobile nav could be expanded later */}
        </div>
      </div>
    </header>
  );
}
