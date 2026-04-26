import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {title && (
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
          </div>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
