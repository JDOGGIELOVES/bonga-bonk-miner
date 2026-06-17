import Link from 'next/link';

export default function Footer() {
  const lastUpdated = 'October 2025';

  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-600">
        <div className="grid md:grid-cols-3 gap-y-8">
          <div>
            <div className="font-semibold text-gray-900 mb-3">Grok Searcher</div>
            <p className="text-xs">Free, high-quality prompts and guides for Grok by xAI.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-medium text-gray-900 mb-2">Explore</div>
              <ul className="space-y-1.5">
                <li><Link href="/best-grok-prompts" className="hover:text-gray-900">Best Prompts</Link></li>
                <li><Link href="/best-grok-image-prompts" className="hover:text-gray-900">Image Prompts</Link></li>
                <li><Link href="/categories" className="hover:text-gray-900">All Categories</Link></li>
                <li><Link href="/comparisons" className="hover:text-gray-900">Comparisons</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-2">Resources</div>
              <ul className="space-y-1.5">
                <li><Link href="/grok-search" className="hover:text-gray-900">How to Search</Link></li>
                <li><Link href="/blog" className="hover:text-gray-900">Blog &amp; Guides</Link></li>
                <li><Link href="/memes" className="hover:text-gray-900">Grok Memes</Link></li>
                <li><a href="https://sitemap.xml" className="hover:text-gray-900">Sitemap</a></li>
              </ul>
            </div>
          </div>

          <div className="text-xs">
            <div className="font-medium text-gray-900 mb-2">Connect</div>
            <div className="space-y-1.5">
              <a href="https://twitter.com/intent/tweet?text=Great%20free%20Grok%20prompts%20%26%20guides%3A%20https%3A%2F%2Fgroksearcher.com" target="_blank" className="hover:text-gray-900 block">Share on X</a>
              <a href="https://grok.x.ai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 block">Try Grok</a>
            </div>
            <div className="mt-4 text-[10px] text-gray-500">
              Content last updated {lastUpdated}.<br />
              Not affiliated with xAI.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
