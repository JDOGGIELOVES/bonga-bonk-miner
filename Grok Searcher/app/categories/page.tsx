'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/categories';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-3">Browse by Category</h1>
      <p className="text-lg text-gray-600 mb-4">Specialized prompt collections for every role and task.</p>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Filter categories... (e.g. business, marketing, engineering)"
        className="w-full max-w-md mb-6 px-4 py-2 border rounded-xl focus:outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <Link 
            key={cat.slug} 
            href={`/grok-for/${cat.slug}`} 
            className="group p-5 bg-white rounded-2xl border hover:border-blue-500 transition"
          >
            <div className="font-semibold text-xl group-hover:text-blue-600">{cat.title}</div>
            <p className="mt-2 text-sm text-gray-600">{cat.description}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p className="mt-6 text-gray-500">No categories match your search.</p>}

      <p className="mt-8 text-xs text-gray-500">More categories added regularly. Missing one? Let us know on X.</p>
    </div>
  );
}
