import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { HiSearch, HiX } from "react-icons/hi";
import { usePreferences } from "../hooks/usePreferences";
import { getAllPosts } from "../api/services/postService";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/ui/PostCardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/Pagination";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "mostCommented", label: "Most commented" },
];

const DEBOUNCE_MS = 300;

const HomePage = () => {
  const { defaultSort, postsPerPage } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTag = searchParams.get("tag") || "";

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
    setPage(1);
  }, [activeTag]);

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

        if (activeTag) {
          params.tag = activeTag;
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
  }, [page, debouncedSearch, sort, postsPerPage, activeTag]);

  const handleSortChange = useCallback((e) => {
    setSort(e.target.value);
    setPage(1);
  }, []);

  const clearTag = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete("tag");
      return prev;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const hasSearch = !!debouncedSearch.trim();

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text">Blog posts</h1>
        <p className="text-muted-foreground">
          Discover the latest posts, read, and like your favorites.
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
            placeholder="Search posts..."
            aria-label="Search posts"
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>

        <select
          value={sort}
          onChange={handleSortChange}
          aria-label="Sort"
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors cursor-pointer sm:w-52"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Tag Filter */}
      {activeTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            {activeTag}
            <button
              onClick={clearTag}
              aria-label="Clear tag filter"
              className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors cursor-pointer"
            >
              <HiX className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <PostCardSkeleton count={postsPerPage || 6} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={HiSearch}
          title={hasSearch ? "No results found" : "No posts yet"}
          message={
            hasSearch
              ? "No posts match your search. Try a different keyword."
              : "Be the first to publish a post!"
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
