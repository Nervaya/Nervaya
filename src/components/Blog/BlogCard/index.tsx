'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaUser, FaCalendar } from 'react-icons/fa6';
import type { Blog } from '@/types/blog.types';
import styles from './styles.module.css';

interface BlogCardProps {
  blog: Blog;
  formatDate: (date: Date) => string;
  getExcerpt: (content: string, maxLength?: number) => string;
}

export default function BlogCard({ blog, formatDate, getExcerpt }: BlogCardProps) {
  return (
    <li key={blog._id}>
      <Link href={`/blog/${blog.slug}`} className={styles.card}>
        <div className={styles.imageWrapper}>
          {blog.coverImage ? (
            <Image src={blog.coverImage} alt={blog.title} fill className={styles.image} />
          ) : (
            <div className={styles.noImage}>
              <span>Nervaya</span>
            </div>
          )}
        </div>
        <div className={styles.content}>
          {blog.tags.length > 0 && (
            <div className={styles.cardTags}>
              {blog.tags.slice(0, 2).map((tag) => (
                <span key={tag} className={styles.cardTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h2 className={styles.cardTitle}>{blog.title}</h2>
          <p className={styles.excerpt}>{getExcerpt(blog.content)}</p>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <FaUser />
              {blog.author}
            </span>
            <span className={styles.metaItem}>
              <FaCalendar />
              {formatDate(blog.createdAt)}
            </span>
            <span className={styles.metaItem}>
              <FaClock />
              {blog.readTime} min read
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
