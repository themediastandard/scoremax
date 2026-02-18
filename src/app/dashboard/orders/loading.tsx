export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-48 bg-gray-200 rounded-lg" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  )
}
