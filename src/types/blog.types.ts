export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTime: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogFormData {
  title: string;
  slug?: string;
  content: string;
  coverImage?: string;
  author: string;
  tags?: string[];
  readTime?: number;
  isPublished?: boolean;
}

export interface BlogListItem {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTime: number;
  isPublished: boolean;
  createdAt: Date;
}
