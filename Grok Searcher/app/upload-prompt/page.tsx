import type { Metadata } from 'next';
import Link from 'next/link';
import UploadPromptForm from '@/components/UploadPromptForm';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Upload Your Favorite Grok Prompt",
  description: "Share your best Grok prompts with the community. Upload and help grow the largest free collection of Grok prompts and tools.",
  openGraph: {
    title: "Upload Your Favorite Grok Prompt | Grok Searcher",
    description: "Contribute to the best free Grok prompt library. Your submissions help everyone get better results.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Upload Grok Prompts",
      },
    ],
    url: "https://groksearcher.com/upload-prompt",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upload Your Favorite Grok Prompt | Grok Searcher",
    description: "Share your best Grok prompts with the community.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Upload Grok Prompts",
      },
    ],
  },
};

export default function UploadPromptPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Upload Your Favorite Prompt</h1>
        <p className="text-xl text-gray-600">
          Share a prompt that works great with Grok. Help the community grow the best free prompt library.
        </p>
      </div>

      <UploadPromptForm />

      <div className="mt-12 text-center text-sm text-gray-500">
        Not ready to share? You can still use all our existing prompts for free.
        <br />
        <Link href="/best-grok-prompts" className="text-blue-600 hover:underline">Explore 50+ Best Prompts →</Link>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Upload Your Favorite Grok Prompt",
            "description": "Share your best Grok prompts with the community.",
            "url": "https://groksearcher.com/upload-prompt",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://groksearcher.com"
            }
          }
        ]
      }} />
    </div>
  );
}
