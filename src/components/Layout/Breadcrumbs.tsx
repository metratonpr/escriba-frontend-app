// src/components/layout/Breadcrumbs.tsx
import { Link } from 'react-router-dom'

export type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-4 select-none">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center">
              {!isLast && item.to ? (
                <Link to={item.to} className="hover:underline text-blue-600">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-gray-800">
                  {item.label}
                </span>
              )}
              {!isLast && <span className="mx-2">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
