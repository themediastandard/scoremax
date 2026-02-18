export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-64 bg-gray-200 rounded-lg" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-10 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
