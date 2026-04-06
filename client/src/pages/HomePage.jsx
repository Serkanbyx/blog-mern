import { useState, useEffect, useCallback, useRef } from "react";
import { HiSearch } from "react-icons/hi";
import { usePreferences } from "../context/PreferencesContext";
import { getAllPosts } from "../api/services/postService";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "popular", label: "En Popüler" },
  { value: "mostCommented", label: "En Çok Yorumlanan" },
];

const DEBOUNCE_MS = 300;

const HomePage = () => {
  const { defaultSort, postsPerPage } = usePreferences();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(defaultSort || "newest");

  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Fetch posts when params change
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: postsPerPage || 10,
          sort,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const { data } = await getAllPosts(params);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch {
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, debouncedSearch, sort, postsPerPage]);

  const handleSortChange = useCallback((e) => {
    setSort(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text">Blog Yazıları</h1>
        <p className="text-muted-foreground">
          En güncel yazıları keşfedin, okuyun ve beğenin.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Yazılarda ara..."
            aria-label="Yazılarda ara"
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={handleSortChange}
          aria-label="Sıralama"
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors cursor-pointer sm:w-52"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: postsPerPage || 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState hasSearch={!!debouncedSearch.trim()} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
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
);

const EmptyState = ({ hasSearch }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <HiSearch className="w-7 h-7 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-text mb-1">
      {hasSearch ? "Sonuç bulunamadı" : "Henüz yazı yok"}
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      {hasSearch
        ? "Arama kriterlerinize uygun yazı bulunamadı. Farklı bir anahtar kelime deneyin."
        : "Blog yazıları burada görünecek. İlk yazıyı eklemeyi bekleyin!"}
    </p>
  </div>
);

export default HomePage;
