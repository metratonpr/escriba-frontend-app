// CompanyWithSectorsSelect.tsx
import { useEffect, useState } from 'react'
import { getCompanies } from '../../services/companyService'
import FormAutocompleteField from './FormAutocompleteField'
import FormSelectField from './FormSelectField'

interface CompanyOption {
  id: number
  name: string
  sectors: SectorOption[]
}

interface SectorOption {
  id: number
  name: string
}

interface Props {
  companyId: number | null
  sectorId: number | null
  onCompanyChange: (value: number | null) => void
  onSectorChange: (value: number | null) => void
  companyError?: string
  sectorError?: string
}

const CompanyWithSectorsSelect = ({
  companyId,
  sectorId,
  onCompanyChange,
  onSectorChange,
  companyError,
  sectorError,
}: Props) => {
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyOption[]>([])
  const [sectors, setSectors] = useState<SectorOption[]>([])

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await getCompanies()
        const data = response?.data || []
        setCompanies(data)
        setFilteredCompanies(data)

        const preSelected = data.find(c => c.id === companyId)
        if (preSelected) setSectors(preSelected.sectors || [])
      } catch (e) {
        console.error('Erro ao carregar empresas:', e)
      }
    }

    loadCompanies()
  }, [])

  const handleCompanySelect = (companyId: number | null) => {
    const company = companies.find(c => c.id === companyId)
    if (company) {
      setSectors(company.sectors || [])
      onSectorChange(null) // limpa setor
    } else {
      setSectors([])
    }
    onCompanyChange(companyId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormAutocompleteField
        label="Empresa"
        options={filteredCompanies.map(c => ({ label: c.name, value: c.id }))}
        value={
          companyId
            ? {
                label: companies.find(c => c.id === companyId)?.name || '',
                value: companyId,
              }
            : null
        }
        onChange={(opt) => handleCompanySelect(opt?.value ?? null)}
        onSearch={(text) => {
          const filtered = companies.filter(company =>
            company.name.toLowerCase().includes(text.toLowerCase())
          )
          setFilteredCompanies(filtered)
        }}
        error={companyError}
      />

      <FormSelectField
        label="Setor"
        name="sector_id"
        value={sectorId ?? ''}
        onChange={(e) => onSectorChange(Number(e.target.value))}
        options={sectors.map(s => ({ label: s.name, value: s.id }))}
        error={sectorError}
        placeholder="Selecione o setor"
      />
    </div>
  )
}

export default CompanyWithSectorsSelect
