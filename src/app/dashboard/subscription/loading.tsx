export default function SubscriptionLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-2xl">
      <div className="h-9 w-52 bg-gray-200 rounded-lg" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="flex gap-6">
          <div className="h-12 w-16 bg-gray-100 rounded" />
          <div className="h-12 w-16 bg-gray-100 rounded" />
          <div className="h-12 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
