export const DRIFT_OFF_HERO_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export const DRIFT_OFF_HERO_VIDEO_TITLE = 'Sample Guided Meditation';
export const DRIFT_OFF_HERO_VIDEO_AUTHOR = 'By Practia';
export const DRIFT_OFF_HERO_VIDEO_IS_FREE = true;

export const DRIFT_OFF_PLAYLIST_VIDEOS = [
  {
    id: 1,
    title: 'Sample Guided Meditation',
    duration: '25 min',
    author: 'By Practia',
    isFree: true,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 2,
    title: 'Evening Wind Down',
    duration: '20 min',
    author: 'By Dr. Sarah Mitchell',
    isFree: false,
    url: 'https://www.youtube.com/watch?v=XsX3ATc3FbA',
  },
] as const;
