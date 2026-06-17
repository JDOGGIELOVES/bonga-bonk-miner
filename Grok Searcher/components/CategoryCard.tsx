import Link from 'next/link';
import Image from 'next/image';

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
        <div className="relative w-full h-48 bg-gray-50">
          <Image 
            src={image} 
            alt={title} 
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        <div className="font-semibold text-lg mb-1">{title}</div>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>
    </Link>
  );
}
