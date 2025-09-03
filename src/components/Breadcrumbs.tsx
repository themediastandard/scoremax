import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://scoremax.com${item.href}` : undefined
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <nav className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 overflow-x-auto pb-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#517cad] transition-colors touch-manipulation whitespace-nowrap">
          Home
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-[#517cad] transition-colors touch-manipulation whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium whitespace-nowrap">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
