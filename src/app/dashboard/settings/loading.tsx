export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-2xl">
      <div className="h-9 w-36 bg-gray-200 rounded-lg" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
