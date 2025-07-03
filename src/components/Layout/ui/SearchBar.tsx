import React, { useState, FormEvent } from 'react'

type SearchBarProps = {
  placeholder?: string
  onSearch: (query: string) => void
  onClear?: () => void
}

export default function SearchBar({ placeholder = "Buscar...", onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery("")
    if (onClear) onClear()
    else onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex items-center gap-2  mb-8">
      <label htmlFor="default-search" className="sr-only">Buscar</label>

      {/* Input com borda arredondada inteira */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          required
          className="
        block
        w-full
        p-4
        pl-10
        text-sm
        text-gray-900
        border
        border-gray-300
        rounded-lg    /* arredondamento total */
        bg-gray-50
        focus:ring-blue-500
        focus:border-blue-500
        dark:bg-gray-700
        dark:border-gray-600
        dark:placeholder-gray-400
        dark:text-white
        dark:focus:ring-blue-500
        dark:focus:border-blue-500
      "
          aria-label="Buscar"
        />
      </div>


      <button
        type="submit"
        className="
      text-white
      bg-blue-700
      hover:bg-blue-800
      focus:ring-4
      focus:outline-none
      focus:ring-blue-300
      font-medium
      rounded-lg
      text-sm
      px-4
      py-2
      w-24            /* largura fixa para igualar */
      h-10            /* altura fixa */
      flex
      items-center
      justify-center
      dark:bg-blue-600
      dark:hover:bg-blue-700
      dark:focus:ring-blue-800
    "
        aria-label="Buscar"
      >
        Buscar
      </button>

      <button
        type="button"
        onClick={handleClear}
        className="
      bg-gray-300
      text-gray-700
      px-4
      py-2
      rounded-lg
      font-medium
      hover:bg-gray-400
      transition
      w-24
      h-10
      flex
      items-center
      justify-center
      dark:bg-gray-600
      dark:text-gray-200
      dark:hover:bg-gray-500
    "
        aria-label="Limpar busca"
      >
        Limpar
      </button>
    </form>

  )
}
