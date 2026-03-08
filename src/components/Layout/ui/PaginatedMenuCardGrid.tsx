import { useClientPagination } from "../../../hooks/useClientPagination";
import InlinePagination from "./InlinePagination";
import ItemMenuCard from "../ItemMenuCard";

export interface MenuCardItem {
  title: string;
  imageSrc: string;
  href: string;
  altText?: string;
}

type PaginatedMenuCardGridProps = {
  items: MenuCardItem[];
  initialPerPage?: number;
};

export default function PaginatedMenuCardGrid({
  items,
  initialPerPage = 8,
}: PaginatedMenuCardGridProps) {
  const pagination = useClientPagination(items, { initialPerPage });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pagination.paginatedItems.map((item) => (
          <ItemMenuCard
            key={`${item.href}-${item.title}`}
            title={item.title}
            imageSrc={item.imageSrc}
            href={item.href}
            altText={item.altText}
          />
        ))}
      </div>

      <InlinePagination
        total={pagination.total}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        perPage={pagination.perPage}
        onPageChange={pagination.setCurrentPage}
        onPerPageChange={pagination.setPerPage}
        perPageOptions={[4, 8, 12, 16]}
      />
    </div>
  );
}
