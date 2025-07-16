

type ToastProps = {
  open: boolean
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}

export default function Toast({ open, message, type = "info", onClose }: ToastProps) {
  if (!open) return null

  const color = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type]

  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${color}`}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-4 underline text-white font-medium"
        aria-label="Fechar notificação"
      >
        Fechar
      </button>
    </div>
  )
}
