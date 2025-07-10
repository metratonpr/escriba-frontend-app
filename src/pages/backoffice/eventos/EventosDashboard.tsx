import React from 'react';
import ItemMenuCard from '../../../components/Layout/ItemMenuCard';
import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs';
import Breadcrumbs from '../../../components/Layout/Breadcrumbs';

export default function EventosDashboard() {
  const cards = [
    { title: 'Eventos', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/eventos' },

  ]

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Eventos', to: '/backoffice/eventos' },
  ]


  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard - Eventos</h1>
        <p className="mt-2 text-gray-600">Selecione uma categoria para gerenciar</p>

        <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
            {cards.map((card) => (
              <ItemMenuCard
                key={card.title}
                title={card.title}
                imageSrc={card.imageSrc}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}