import { useState, useEffect, useCallback, useRef } from "react";
import { HiSearch } from "react-icons/hi";
import { usePreferences } from "../context/PreferencesContext";
import { getAllPosts } from "../api/services/postService";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/ui/PostCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
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

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [search]);

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

  const hasSearch = !!debouncedSearch.trim();

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
        <PostCardSkeleton count={postsPerPage || 6} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={HiSearch}
          title={hasSearch ? "Sonuç bulunamadı" : "Henüz yazı yok"}
          message={
            hasSearch
              ? "Arama kriterlerinize uygun yazı bulunamadı. Farklı bir anahtar kelime deneyin."
              : "İlk yazıyı yazmak için cesaret gösterin!"
          }
        />
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

export default HomePage;
