const PostCardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse"
      >
        <div className="aspect-video bg-muted" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-2.5 w-16 bg-muted rounded" />
            </div>
          </div>
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PostCardSkeleton;
