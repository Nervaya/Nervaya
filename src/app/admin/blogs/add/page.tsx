'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoChevronBack } from 'react-icons/io5';
import BlogForm from '@/components/Admin/BlogForm';
import PageHeader from '@/components/PageHeader/PageHeader';
import styles from './styles.module.css';
import 'react-quill-new/dist/quill.snow.css';

export default function AddBlogPage() {
  const router = useRouter();
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

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, content, tags }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create blog');
      router.push('/admin/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Create New Blog"
        subtitle="Add a new blog post to your platform"
        actions={
          <Link href="/admin/blogs" className={styles.backLink}>
            <IoChevronBack aria-hidden />
            Back to Blogs
          </Link>
        }
      />

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
        submitLabel="Create Blog"
        error={error}
        showPublished={false}
      />
    </div>
  );
}
