'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ICON_ADD, ICON_SEARCH } from '@/constants/icons';
import { blogsApi } from '@/lib/api/blogs';
import { LottieLoader, Pagination } from '@/components/common';
import { ConfirmDeleteDialog, BlogListCard } from '@/components/Admin/BlogList';
import type { Blog } from '@/types/blog.types';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE_3,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const fetchBlogs = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogsApi.getAllForAdmin({
        page,
        limit: PAGE_SIZE_3,
        search: search.trim() || undefined,
      });
      if (response.success && response.data) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(pagination.page, searchQuery);
  }, [pagination.page, searchQuery, fetchBlogs]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const response = await blogsApi.delete(confirmDelete.id);
      if (response.success) {
        setConfirmDelete(null);
        await fetchBlogs(pagination.page, searchQuery);
      } else {
        setError('Failed to delete blog');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.container}>
      {confirmDelete && (
        <ConfirmDeleteDialog
          title={confirmDelete.title}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <section className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Blogs</h1>
          <p className={styles.subtitle}>Manage blog posts, drafts, and publishing workflow.</p>
          <div className={styles.stats}>
            <span className={styles.statPill}>{pagination.total} total posts</span>
            {searchQuery ? <span className={styles.statHint}>Filtering: &quot;{searchQuery}&quot;</span> : null}
          </div>
        </div>
        <Link href="/admin/blogs/add" className={styles.addButton}>
          <Icon icon={ICON_ADD} aria-hidden />
          New Blog
        </Link>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSearchSubmit} className={styles.filters}>
        <label className={styles.searchField}>
          <Icon icon={ICON_SEARCH} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search by title or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
            aria-label="Search blogs"
          />
        </label>
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {loading ? (
        <LottieLoader width={96} height={96} label="Loading blogs" centerPage />
      ) : blogs.length === 0 ? (
        <>
          <div className={styles.empty}>
            <p>{searchQuery ? 'No blogs match your search.' : 'No blogs found'}</p>
            <Link href="/admin/blogs/add" className={styles.emptyAddButton}>
              Create your first blog
            </Link>
          </div>
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
            ariaLabel="Manage blogs pagination"
          />
        </>
      ) : (
        <>
          <ul className={styles.list} aria-label="Blog list">
            {blogs.map((blog) => (
              <BlogListCard
                key={blog._id}
                blog={blog}
                formatDate={formatDate}
                onDelete={() => setConfirmDelete({ id: blog._id, title: blog.title })}
              />
            ))}
          </ul>
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
            ariaLabel="Manage blogs pagination"
          />
        </>
      )}
    </div>
  );
}
