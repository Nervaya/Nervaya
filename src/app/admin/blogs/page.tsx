'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa6';
import api from '@/lib/axios';
import LottieLoader from '@/components/common/LottieLoader';
import PageHeader from '@/components/PageHeader/PageHeader';
import Pagination from '@/components/common/Pagination';
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
      const params = new URLSearchParams();
      params.set('admin', 'true');
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE_3));
      if (search.trim()) params.set('search', search.trim());
      const response = (await api.get(`/blogs?${params.toString()}`)) as {
        success: boolean;
        data: { blogs: Blog[]; pagination: PaginationInfo };
      };
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
      const response = (await api.delete(`/blogs/${confirmDelete.id}`)) as { success: boolean };
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

      <PageHeader
        title="Blogs"
        subtitle="Manage blog posts and content"
        actions={
          <Link href="/admin/blogs/add" className={styles.addButton}>
            <FaPlus aria-hidden />
            New Blog
          </Link>
        }
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSearchSubmit} className={styles.filters}>
        <input
          type="search"
          placeholder="Search by title or author..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={styles.searchInput}
          aria-label="Search blogs"
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {loading ? (
        <div className={styles.loading}>
          <LottieLoader width={100} height={100} />
        </div>
      ) : blogs.length === 0 ? (
        <div className={styles.empty}>
          <p>{searchQuery ? 'No blogs match your search.' : 'No blogs found'}</p>
          <Link href="/admin/blogs/add" className={styles.emptyAddButton}>
            Create your first blog
          </Link>
        </div>
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
          {pagination.totalPages > 0 && (
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={goToPage}
              ariaLabel="Manage blogs pagination"
            />
          )}
        </>
      )}
    </div>
  );
}
