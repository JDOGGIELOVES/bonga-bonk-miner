export interface Category {
  slug: string;
  title: string;
  description: string;
  image?: string;
  keywords?: string;
}

export const categories: Category[] = [
  { slug: 'business', title: 'Grok for Business', description: 'Practical prompts for meetings, strategy, research, content and operations.', image: '/images/grok-for-business-2026.jpg' },
  { slug: 'marketing', title: 'Grok for Marketing', description: 'Content, social, email, SEO & campaign prompts using real-time signals.', image: '/images/grok-for-marketing-2026.jpg' },
  { slug: 'sales', title: 'Grok for Sales', description: 'Outreach, account research, proposals and objection handling.', image: '/images/grok-for-sales-2026.jpg' },
  { slug: 'engineers', title: 'Grok for Engineers', description: 'Code review, system design, debugging and learning new tech.', image: '/images/grok-for-engineers-2026.jpg' },
  { slug: 'entrepreneurs', title: 'Grok for Entrepreneurs', description: 'Idea validation, pitch decks, fundraising and growth experiments.', image: '/images/grok-for-entrepreneurs-2026.jpg' },
  { slug: 'students', title: 'Grok for Students', description: 'Study aids, essays, research, exam prep and time management.', image: '/images/grok-for-students-2026.jpg' },
  { slug: 'teachers', title: 'Grok for Teachers', description: 'Lesson planning, differentiation and parent communications.', image: '/images/grok-for-teachers-2026.jpg' },
  { slug: 'product-managers', title: 'Grok for Product Managers', description: 'PRDs, roadmaps, user research and stakeholder updates.', image: '/images/grok-for-product-managers-2026.jpg' },
  { slug: 'data-analysts', title: 'Grok for Data Analysts', description: 'Data cleaning, visualization, dashboards and storytelling.', image: '/images/grok-for-data-analysts-2026.jpg' },
  { slug: 'copywriters', title: 'Grok for Copywriters', description: 'Headlines, long-form, emails and brand voice content.', image: '/images/grok-for-copywriters-2026.jpg' },
  { slug: 'hr', title: 'Grok for HR', description: 'Job descriptions, interviews, onboarding and performance reviews.', image: '/images/grok-for-hr-2026.jpg' },
  { slug: 'lawyers', title: 'Grok for Lawyers', description: 'Contract review, legal research and case strategy.', image: '/images/grok-for-lawyers-2026.jpg' },
  { slug: 'real-estate', title: 'Grok for Real Estate', description: 'Listings, market analysis, client scripts and negotiations.', image: '/images/grok-for-real-estate-2026.jpg' },
  { slug: 'musicians', title: 'Grok for Musicians & Writers', description: 'Lyrics, song ideas, bios and creative block breaking.', image: '/images/grok-for-musicians-2026.jpg' },
  { slug: 'assistants', title: 'Grok for Assistants & Secretaries', description: 'Administrative work, emails, calendars and research.', image: '/images/grok-for-assistants-secretaries-2026.jpg' },
];

export function getCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug);
}
