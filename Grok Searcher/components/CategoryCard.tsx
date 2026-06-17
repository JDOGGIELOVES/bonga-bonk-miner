import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  image?: string;
}

export default function CategoryCard({ title, description, href, image }: CategoryCardProps) {
  return (
    <Link href={href} className="block bg-white rounded-2xl border hover:border-blue-500 hover:shadow transition featured-card overflow-hidden">
      {image && (
        <img 
          src={image} 
          alt={title} 
          className="w-full h-auto max-h-48 object-contain bg-gray-50" 
        />
      )}
      <div className="p-4">
        <div className="font-semibold text-lg mb-1">{title}</div>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>
    </Link>
  );
}
