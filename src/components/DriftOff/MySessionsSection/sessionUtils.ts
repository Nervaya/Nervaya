import { IDriftOffResponse } from '@/types/driftOff.types';

export const sortSessionsByDate = (items: IDriftOffResponse[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getSessionStatus = (session: IDriftOffResponse) => {
  const isReady = Boolean(session.assignedVideoUrl);
  const isPreparing = session.completedAt && !session.assignedVideoUrl;
  const hasPendingReSessionRequest = Boolean(session.reSessionRequestedAt && !session.reSessionResolvedAt);

  if (hasPendingReSessionRequest) return 'Requested';
  if (isReady) return 'Ready';
  if (isPreparing) return 'Preparing';
  return 'Pending';
};
