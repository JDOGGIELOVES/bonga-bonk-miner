'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PromptCard from '@/components/PromptCard';

interface FormData {
  title: string;
  prompt: string;
  category: string;
  guidance: string;
  name: string;
}

export default function UploadPromptForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    prompt: '',
    category: 'General',
    guidance: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'General',
    'Productivity',
    'Creative Writing',
    'Business',
    'Coding & Tech',
    'Marketing',
    'Fun & Humor',
    'Research & Analysis',
    'Storytelling',
    'Image Generation',
    'Other',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      setFormData({
        title: '',
        prompt: '',
        category: 'General',
        guidance: '',
        name: '',
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPrompt = formData.prompt.trim()
    ? {
        text: formData.prompt,
        guidance: formData.guidance || 'User-submitted prompt',
      }
    : null;

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-4xl font-bold mb-4">Thank you!</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Your prompt has been submitted. We review everything and will feature the best ones in our library.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/free-grok-tools"
            className="px-8 py-3 bg-white border rounded-2xl hover:bg-gray-50 transition"
          >
            Back to Free Tools
          </Link>
          <Link
            href="/categories"
            className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition"
          >
            Browse All Prompts
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Want to share more? <a href="https://x.com" target="_blank" className="underline">Post it on X</a> and tag us!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Prompt Title (optional)</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Perfect Email Follow-up"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Your Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
            rows={6}
            placeholder="e.g. Turn this meeting note into a clear action plan with owners, deadlines and next steps."
            className="w-full border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use [brackets] for placeholders so others can customize it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Name / Handle (optional)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="@yourhandle on X"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Guidance / When to Use (optional)</label>
          <textarea
            name="guidance"
            value={formData.guidance}
            onChange={handleChange}
            rows={3}
            placeholder="Great after meetings or when you need clear next steps..."
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !formData.prompt.trim()}
          className="w-full bg-black text-white py-4 rounded-2xl font-medium disabled:opacity-50 hover:bg-gray-900 transition"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
        </button>

        <p className="text-xs text-center text-gray-500">
          We review submissions and add the best ones to our public library. You can remain anonymous.
        </p>
      </form>

      {formData.prompt.trim() && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3">Live Preview</h3>
          <PromptCard 
            text={formData.prompt} 
            guidance={formData.guidance || 'User-submitted prompt'} 
          />
        </div>
      )}
    </div>
  );
}
