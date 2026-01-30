import { Loader2 } from 'lucide-react'

export default function LoadingModal({ isOpen, message = 'Please wait...' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <Loader2 className="w-12 h-12 text-gray-900 dark:text-white animate-spin" />
        <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
          {message}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          This may take a few moments
        </p>
      </div>
    </div>
  )
}
