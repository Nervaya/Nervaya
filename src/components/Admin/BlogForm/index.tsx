'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { IoAdd, IoClose } from 'react-icons/io5';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import LottieLoader from '@/components/common/LottieLoader';
import { quillModules, quillFormats } from '@/lib/constants/blogEditor.constants';
import styles from './styles.module.css';

export interface BlogFormState {
  title: string;
  author: string;
  coverImage: string;
  isPublished: boolean;
}

interface BlogFormProps {
  formData: BlogFormState;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  content: string;
  onContentChange: (value: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  onImageUpload: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
  error: string | null;
  showPublished?: boolean;
}

export default function BlogForm({
  formData,
  onInputChange,
  content,
  onContentChange,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  onImageUpload,
  onSubmit,
  isSubmitting,
  submitLabel,
  error,
  showPublished = false,
}: BlogFormProps) {
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import('react-quill-new'), {
        ssr: false,
        loading: () => <div className={styles.editorLoading}>Loading editor...</div>,
      }),
    [],
  );

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={styles.input}
              placeholder="Enter blog title..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Content <span className={styles.required}>*</span>
            </label>
            <p className={styles.contentTip}>
              <strong>Tip:</strong> Press <kbd>Enter</kbd> to start a new paragraph. Keep paragraphs short (3–5
              sentences) so readers get a clear break. The editor width matches the blog view so you see where lines
              end.
            </p>
            <div className={styles.editorReadingWidth}>
              <div className={styles.editorWrapper}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={onContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write your blog content..."
                  className={styles.editor}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image</label>
            <ImageUpload onUpload={onImageUpload} initialUrl={formData.coverImage} label="Upload Cover" compact />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="author" className={styles.label}>
              Author <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={onInputChange}
              className={styles.input}
              placeholder="Author name..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagInputWrapper}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={onTagKeyDown}
                className={styles.input}
                placeholder="Add a tag..."
              />
              <button type="button" onClick={onAddTag} className={styles.addTagButton}>
                <IoAdd />
              </button>
            </div>
            {tags.length > 0 && (
              <div className={styles.tagsList}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button type="button" onClick={() => onRemoveTag(tag)} className={styles.removeTagButton}>
                      <IoClose />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {showPublished && (
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={onInputChange}
                  className={styles.checkbox}
                />
                <span>Published</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <Link href="/admin/blogs" className={styles.cancelButton}>
          Cancel
        </Link>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LottieLoader width={24} height={24} />
              {submitLabel.replace(' Blog', 'ing...')}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
