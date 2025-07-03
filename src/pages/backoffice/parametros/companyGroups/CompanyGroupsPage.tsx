import React, { useEffect, useState } from 'react'
import {
  getCompanyGroups,
  deleteCompanyGroup,
  type CompanyGroup,
  type PaginatedResponse
} from '../../../../services/companyGroupService'
import type { BreadcrumbItem } from '../../../../components/Layout/Breadcrumbs'
import Breadcrumbs from '../../../../components/Layout/Breadcrumbs'
import Spinner from '../../../../components/Layout/ui/Spinner'
import SearchBar from '../../../../components/Layout/ui/SearchBar'
import TableTailwind, { type Column } from '../../../../components/Layout/ui/TableTailwind'
import DeleteModal from '../../../../components/Layout/ui/DeleteModal'
import Toast from '../../../../components/Layout/Feedback/Toast'


export default function CompanyGroupsPage() {
  const [groupsData, setGroupsData] = useState<PaginatedResponse<CompanyGroup>>({
    data: [],
    total: 0,
    per_page: 25,
    current_page: 1,
    last_page: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({ open: false, message: "", type: "success" });


  const loadGroups = async (searchQuery = '', pageNumber = 1, perPageCount = 25) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCompanyGroups({ search: searchQuery, page: pageNumber, perPage: perPageCount })
      setGroupsData(response)
      setPage(pageNumber)
      setPerPage(perPageCount)
    } catch {
      setError('Erro ao carregar grupos de empresa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups(search, page, perPage)
  }, [])

  const handleSearch = (query: string) => {
    setSearch(query)
    loadGroups(query, 1, perPage)
  }

  const handleClear = () => {
    setSearch('')
    loadGroups('', 1, perPage)
  }

  const handlePageChange = (newPage: number) => {
    loadGroups(search, newPage, perPage)
  }

  const handlePerPageChange = (newPerPage: number) => {
    loadGroups(search, 1, newPerPage)
  }

  const handleAskDelete = (id: number) => {
    const group = groupsData.data.find((g) => g.id === id)
    setSelectedId(id)
    setSelectedName(group?.name ?? null)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedId) return
    try {
      await deleteCompanyGroup(selectedId)
      await loadGroups(search, page, perPage)
      setToast({
        open: true,
        message: `Grupo "${selectedName}" excluído com sucesso.`,
        type: "success",
      })
    } catch {
      setToast({
        open: true,
        message: `Erro ao excluir grupo "${selectedName}".`,
        type: "error",
      })
    } finally {
      setModalOpen(false)
      setSelectedId(null)
      setSelectedName(null)
    }
  }


  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Parâmetros', to: '/backoffice/parametros' },
    { label: 'Grupos de Empresa', to: '/backoffice/grupos-empresa' },
  ]

  const columns: Column<CompanyGroup>[] = [
    { label: 'Nome', field: 'name', sortable: true },
    { label: 'Responsável', field: 'responsible', sortable: true },
    { label: 'Email', field: 'contact_email', sortable: false },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <SearchBar onSearch={handleSearch} onClear={handleClear} />

      {loading && <Spinner />}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      {!loading && !error && (
        <TableTailwind
          title="Grupos de Empresas"
          createUrl="/backoffice/grupos-empresa/novo"
          columns={columns}
          data={groupsData.data}
          pagination={{
            total: groupsData.total,
            perPage: groupsData.per_page,
            currentPage: page,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange,
          }}
          getEditUrl={(id) => `/backoffice/grupos-empresa/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir grupo de empresa"
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />


    </>
  )
}
