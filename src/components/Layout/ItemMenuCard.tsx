import React from 'react'
import { Link } from 'react-router-dom'

type ItemMenuCardProps = {
  title: string
  imageSrc: string
  altText?: string
  href: string
}

export default function ItemMenuCard({ title, imageSrc, altText = '', href }: ItemMenuCardProps) {
  return (
    <Link
      to={href}
      className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 transition p-4 flex flex-col items-center text-center"
    >
      <img src={imageSrc} alt={altText || title} className="w-20 h-20 object-contain mb-4" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </Link>
  )
}
