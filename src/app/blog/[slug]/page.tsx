'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaUser, FaCalendar, FaChevronLeft, FaShareNodes } from 'react-icons/fa6';
import Sidebar from '@/components/Sidebar/LazySidebar';
import LottieLoader from '@/components/common/LottieLoader';
import api from '@/lib/axios';
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
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = (await api.get(`/blogs/slug/${slug}`)) as { success: boolean; data: Blog };
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
      setShareMessage('Link copied to clipboard!');
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
            <FaChevronLeft />
            Back to Blog
          </Link>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <article className={styles.container}>
        <div className={styles.navigation}>
          <Link href="/blog" className={styles.backLink}>
            <FaChevronLeft />
            Back to Blog
          </Link>
          <button onClick={handleShare} className={styles.shareButton}>
            <FaShareNodes />
            Share
          </button>
          {shareMessage && (
            <span className={styles.shareMessage} role="status">
              {shareMessage}
            </span>
          )}
        </div>

        {blog.coverImage && (
          <div className={styles.heroImage}>
            <Image src={blog.coverImage} alt={blog.title} fill className={styles.image} priority />
            <div className={styles.heroOverlay} />
          </div>
        )}

        <header className={styles.header}>
          {blog.tags.length > 0 && (
            <div className={styles.tags}>
              {blog.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className={styles.title}>{blog.title}</h1>

          <div className={styles.meta}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>
                <FaUser />
              </div>
              <div className={styles.authorDetails}>
                <span className={styles.authorName}>{blog.author}</span>
                <span className={styles.publishDate}>{formatDate(blog.createdAt)}</span>
              </div>
            </div>
            <div className={styles.readTime}>
              <FaClock />
              <span>{blog.readTime} min read</span>
            </div>
          </div>
        </header>

        {/* eslint-disable-next-line react/no-danger -- Blog content from API; rich text rendered as HTML */}
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: blog.content }} />

        <footer className={styles.footer}>
          <div className={styles.footerMeta}>
            <span className={styles.metaItem}>
              <FaCalendar />
              Published on {formatDate(blog.createdAt)}
            </span>
          </div>
          <div className={styles.footerActions}>
            <button onClick={handleShare} className={styles.shareButtonLarge}>
              <FaShareNodes />
              Share this article
            </button>
          </div>
        </footer>

        <div className={styles.backToBlogs}>
          <Link href="/blog" className={styles.backButton}>
            <FaChevronLeft />
            Back to all blogs
          </Link>
        </div>
      </article>
    </Sidebar>
  );
}
