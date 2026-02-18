export default function CustomersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
