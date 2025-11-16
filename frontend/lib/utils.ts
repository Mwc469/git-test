/**
 * Utility functions
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  return bytes + ' bytes';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    YOUTUBE: 'bg-red-500',
    INSTAGRAM: 'bg-pink-500',
    FACEBOOK: 'bg-blue-600',
    TIKTOK: 'bg-black',
  };
  return colors[platform] || 'bg-gray-500';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    SCHEDULED: 'bg-blue-500',
    PUBLISHING: 'bg-yellow-500',
    PUBLISHED: 'bg-green-500',
    FAILED: 'bg-red-500',
    ACTIVE: 'bg-green-500',
    APPLIED: 'bg-blue-500',
    DISMISSED: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}
