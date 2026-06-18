import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mapping of old .html paths (from previous static site) to new clean Next.js routes
const oldToNew: Record<string, string> = {
  '/index.html': '/',
  '/50-best-grok-prompts.html': '/best-grok-prompts',
  '/best-grok-memes-2026.html': '/memes',
  '/grok-search-research-guide-2026.html': '/grok-search',
  '/grok-vs-chatgpt-vs-claude-2026.html': '/comparisons/grok-vs-chatgpt',
  '/grok-vs-chatgpt-claude.html': '/comparisons/grok-vs-chatgpt',
  '/beginner-prompts.html': '/best-grok-prompts',
  '/grok-pricing.html': '/',
  '/grok-4-features.html': '/',
  '/grok-limits.html': '/',
  '/grok-build-cli.html': '/',
  '/grok-imagine-tips.html': '/',
  '/funny-grok.html': '/memes',
  '/grok-productivity.html': '/',
  '/grok-creative-writing.html': '/',
  '/grok-api-basics.html': '/',
  '/how-to-use-grok.html': '/',
  // grok-for with -2026
  '/grok-for-business-2026.html': '/grok-for/business',
  '/grok-for-assistants-secretaries-2026.html': '/grok-for/assistants',
  '/grok-for-marketing-2026.html': '/grok-for/marketing',
  '/grok-for-sales-2026.html': '/grok-for/sales',
  '/grok-for-musicians-music-makers-writers-2026.html': '/grok-for/musicians',
  '/grok-for-hr-2026.html': '/grok-for/hr',
  '/grok-for-product-managers-2026.html': '/grok-for/product-managers',
  '/grok-for-teachers-2026.html': '/grok-for/teachers',
  '/grok-for-engineers-2026.html': '/grok-for/engineers',
  '/grok-for-real-estate-2026.html': '/grok-for/real-estate',
  '/grok-for-lawyers-2026.html': '/grok-for/lawyers',
  '/grok-for-students-2026.html': '/grok-for/students',
  '/grok-for-data-analysts-2026.html': '/grok-for/data-analysts',
  '/grok-for-copywriters-2026.html': '/grok-for/copywriters',
  '/grok-for-video-creators-2026.html': '/grok-for/video-creators',
  '/grok-for-entrepreneurs-2026.html': '/grok-for/entrepreneurs',
  '/grok-for-healthcare-2026.html': '/grok-for/healthcare',
  '/grok-for-investors-2026.html': '/grok-for/investors',
  '/grok-for-language-learners-2026.html': '/grok-for/language-learners',
  '/grok-for-fitness-health-2026.html': '/grok-for/fitness',
  '/grok-for-travel-planners-2026.html': '/grok-for/travel-planners',
  '/grok-for-social-media-managers-2026.html': '/grok-for/social-media',
  '/grok-for-market-research-2026.html': '/grok-for/market-research',
  '/grok-for-customer-support-2026.html': '/grok-for/customer-support',
  '/grok-for-personal-finance-2026.html': '/grok-for/personal-finance',
  '/grok-for-dating-relationships.html': '/grok-for/dating-relationships',
  '/grok-for-parenting-family.html': '/grok-for/parenting-family',
  '/grok-for-pet-care.html': '/grok-for/pet-care',
  '/grok-for-gardening-diy.html': '/grok-for/gardening-diy',
  '/grok-for-sustainability.html': '/grok-for/sustainability',
  '/grok-for-nonprofits.html': '/grok-for/nonprofits',
  '/grok-for-consulting.html': '/grok-for/consulting',
  '/grok-for-cloud-devops.html': '/grok-for/cloud-devops',
  '/grok-for-machine-learning.html': '/grok-for/machine-learning',
  '/grok-for-event-planning.html': '/grok-for/event-planning',
  '/grok-for-music-production.html': '/grok-for/music-production',
  '/grok-for-ecommerce.html': '/grok-for/ecommerce',
  '/grok-for-grant-writing.html': '/grok-for/grant-writing',
  '/grok-for-competitive-intelligence.html': '/grok-for/competitive-intelligence',
  '/grok-for-risk-management.html': '/grok-for/risk-management',
  '/grok-for-team-collaboration.html': '/grok-for/team-collaboration',
  '/grok-for-leadership.html': '/grok-for/leadership',
  '/grok-for-fashion-style.html': '/grok-for/fashion-style',
  '/grok-for-history-philosophy.html': '/grok-for/history-philosophy',
  '/grok-for-astronomy.html': '/grok-for/astronomy',
  '/grok-for-mental-health.html': '/grok-for/mental-health',
  '/grok-for-automotive.html': '/grok-for/automotive',
  '/grok-for-sports.html': '/grok-for/sports',
  '/grok-for-ar-vr.html': '/grok-for/ar-vr',
  '/grok-for-robotics.html': '/grok-for/robotics',
  '/grok-for-quantum.html': '/grok-for/quantum',
  '/grok-for-web3-crypto.html': '/grok-for/web3-crypto',
  // Additional old variants without -2026 where applicable
  '/grok-for-business.html': '/grok-for/business',
  '/grok-for-marketing.html': '/grok-for/marketing',
  // Add more if needed from old sitemap/index
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle old .html links from previous static site (Google indexed)
  if (pathname.endsWith('.html')) {
    // Allow Google Search Console (and similar) verification files to be served statically from /public
    if (/^\/google[a-z0-9_-]+\.html$/i.test(pathname)) {
      return NextResponse.next();
    }
    let redirectTo = oldToNew[pathname];

    if (!redirectTo) {
      // Try to auto-map common patterns like /grok-for-xxx-2026.html or /grok-for-xxx.html
      const base = pathname.replace('.html', '');
      if (base.startsWith('/grok-for-')) {
        let slug = base.replace('/grok-for-', '');
        if (slug.endsWith('-2026')) slug = slug.replace('-2026', '');
        // Handle known slug remaps
        const remaps: Record<string, string> = {
          'assistants-secretaries': 'assistants',
          'musicians-music-makers-writers': 'musicians',
          'fitness-health': 'fitness',
          'social-media-managers': 'social-media',
        };
        slug = remaps[slug] || slug;
        redirectTo = `/grok-for/${slug}`;
      } else if (base === '/index') {
        redirectTo = '/';
      } else if (base === '/50-best-grok-prompts' || base === '/beginner-prompts') {
        redirectTo = '/best-grok-prompts';
      } else if (base === '/best-grok-memes' || base === '/funny-grok') {
        redirectTo = '/memes';
      } else if (base === '/grok-search-research-guide') {
        redirectTo = '/grok-search';
      } else if (base === '/grok-vs-chatgpt-vs-claude' || base === '/grok-vs-chatgpt-claude') {
        redirectTo = '/comparisons/grok-vs-chatgpt';
      } else {
        // Fallback for other old pages
        redirectTo = '/';
      }
    }

    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url), 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*.html',
};
