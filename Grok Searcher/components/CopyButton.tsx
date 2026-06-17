'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-3 py-1 rounded-full font-medium transition copy-btn ${
        copied ? 'bg-green-600 text-white copied' : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {copied ? 'Copied!' : 'Copy Prompt'}
    </button>
  );
}
