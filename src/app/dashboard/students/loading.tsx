export default function StudentsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading students">
      <div className="space-y-2">
        <div className="h-9 w-44 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
      </div>
      <div className="space-y-3">
        {[0, 1].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>
    </div>
  )
}
