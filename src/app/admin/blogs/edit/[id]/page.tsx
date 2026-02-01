'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoChevronBack } from 'react-icons/io5';
import BlogForm from '@/components/Admin/BlogForm';
import LottieLoader from '@/components/common/LottieLoader';
import api from '@/lib/axios';
import type { Blog } from '@/types/blog.types';
import styles from '../../add/styles.module.css';
import 'react-quill-new/dist/quill.snow.css';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImage: '',
    isPublished: false,
  });
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = (await api.get(`/blogs/${id}`)) as { success: boolean; data: Blog };
        if (response.success && response.data) {
          const blog = response.data;
          setFormData({
            title: blog.title,
            author: blog.author,
            coverImage: blog.coverImage || '',
            isPublished: blog.isPublished,
          });
          setContent(blog.content);
          setTags(blog.tags || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!content.trim() || content === '<p><br></p>') throw new Error('Content is required');
      if (!formData.author.trim()) throw new Error('Author is required');

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, content, tags }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update blog');
      router.push('/admin/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <LottieLoader width={100} height={100} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/blogs" className={styles.backLink}>
          <IoChevronBack aria-hidden />
          Back to Blogs
        </Link>
        <h1 className={styles.title}>Edit Blog</h1>
      </header>

      <BlogForm
        formData={formData}
        onInputChange={handleInputChange}
        content={content}
        onContentChange={setContent}
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onTagKeyDown={handleTagKeyDown}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Blog"
        error={error}
        showPublished={true}
      />
    </div>
  );
}
