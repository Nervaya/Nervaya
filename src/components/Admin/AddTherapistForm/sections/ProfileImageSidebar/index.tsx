import { Icon } from '@iconify/react';
import ImageUpload from '@/components/ImageUpload/ImageUpload';
import { ICON_USER } from '@/constants/icons';
import fieldStyles from '../../fieldStyles.module.css';
import styles from './styles.module.css';

interface ProfileImageSidebarProps {
  imageUrl: string;
  onImageUpload: (url: string) => void;
}

export function ProfileImageSidebar({ imageUrl, onImageUpload }: ProfileImageSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>
        <Icon icon={ICON_USER} />
        <span>Profile Image</span>
      </h2>
      <div className={styles.imageUploadWrapper}>
        <ImageUpload onUpload={onImageUpload} initialUrl={imageUrl} label="Upload photo" tone="light" />
      </div>
      <span className={fieldStyles.hint}>Square, 400x400px min</span>
    </aside>
  );
}
