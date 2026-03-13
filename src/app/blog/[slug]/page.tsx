'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { ICON_USER, ICON_ARROW_LEFT, ICON_SHARE } from '@/constants/icons';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import { blogsApi } from '@/lib/api/blogs';
import type { Blog } from '@/types/blog.types';
import styles from './styles.module.css';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogsApi.getBySlug(slug);
        if (response.success && response.data) {
          setBlog(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.loadingContainer}>
          <LottieLoader width={100} height={100} />
        </div>
      </Sidebar>
    );
  }

  if (error || !blog) {
    return (
      <Sidebar>
        <div className={styles.errorContainer}>
          <h2>Blog Not Found</h2>
          <p>{error || 'The blog post you are looking for does not exist.'}</p>
          <Link href="/blog" className={styles.backButton}>
            <Icon icon={ICON_ARROW_LEFT} />
            Back to Blog
          </Link>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <article className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{blog.title}</h1>

          <div className={styles.meta}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                <Icon icon={ICON_USER} width={24} height={24} />
              </div>
              <div className={styles.metaText}>
                <div className={styles.authorRow}>
                  <span className={styles.authorName}>{blog.author}</span>
                </div>
                <div className={styles.subMeta}>
                  <span className={styles.publishDate}>{formatDate(blog.createdAt)}</span>
                  <span className={styles.metaDot}>•</span>
                  <span className={styles.readTimeText}>{blog.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {blog.coverImage && (
          <div className={styles.heroImage}>
            <Image src={blog.coverImage} alt={blog.title} fill className={styles.image} priority />
          </div>
        )}

        <div className={styles.contentWrapper}>
          {/* eslint-disable-next-line react/no-danger */}
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: blog.content }} />

          {blog.tags.length > 0 && (
            <div className={styles.tags}>
              {blog.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerActions}>
            <button onClick={handleShare} className={styles.shareButtonLarge}>
              <Icon icon={ICON_SHARE} width={20} />
              Share this article
            </button>
            <Link href="/blog" className={styles.backButton}>
              <Icon icon={ICON_ARROW_LEFT} width={18} />
              Back to all insights
            </Link>
          </div>
        </footer>
      </article>
    </Sidebar>
  );
}
