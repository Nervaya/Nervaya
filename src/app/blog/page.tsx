'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import Pagination from '@/components/common/Pagination';
import { BlogFilters, BlogGrid } from '@/components/Blog';
import { blogsApi } from '@/lib/api/blogs';
import type { Blog } from '@/types/blog.types';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE_3,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchBlogs = useCallback(async (page: number, tag: string | null, search: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogsApi.getAll({
        page,
        limit: PAGE_SIZE_3,
        tag: tag || undefined,
        search: search.trim() || undefined,
      });
      if (response.success && response.data) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
        setAllTags(response.data.allTags || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(1, selectedTag, searchQuery);
  }, [selectedTag, searchQuery, fetchBlogs]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBlogs(page, selectedTag, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleFilterChange = (value: string | null) => {
    setSelectedTag(value);
    setSearchQuery('');
    setSearchInput('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength ? `${plainText.substring(0, maxLength)}...` : plainText;
  };

  return (
    <Sidebar>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.subtitle}>Insights, tips, and stories about sleep wellness</p>
        </header>

        <BlogFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          allTags={allTags}
          selectedTag={selectedTag}
          onFilterChange={handleFilterChange}
        />

        {loading ? (
          <div className={styles.loading}>
            <LottieLoader width={100} height={100} />
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {blogs.length === 0 ? (
              <div className={styles.empty}>
                <p>
                  {searchQuery || selectedTag
                    ? 'No posts match your filters. Try a different search or tag.'
                    : 'No blog posts available yet.'}
                </p>
              </div>
            ) : (
              <BlogGrid blogs={blogs} formatDate={formatDate} getExcerpt={getExcerpt} />
            )}
            {pagination.total >= 0 && (
              <Pagination
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
                ariaLabel="Blog pagination"
              />
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
}
