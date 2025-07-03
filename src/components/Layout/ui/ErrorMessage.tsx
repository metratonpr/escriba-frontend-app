// src/components/ui/ErrorMessage.tsx
type ErrorMessageProps = {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      aria-live="assertive"
    >
      <strong className="font-bold">Erro: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  )
}
