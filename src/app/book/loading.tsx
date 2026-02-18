export default function BookLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-8">
        <div className="text-center space-y-3">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto" />
          <div className="h-4 w-96 bg-gray-100 rounded mx-auto" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-12 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
