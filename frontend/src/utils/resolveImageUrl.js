export function resolveImageUrl(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') {
    return '';
  }

  const trimmed = rawPath.trim();

  if (!trimmed) {
    return '';
  }

  // Already usable URLs / previews.
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Normalize Windows slashes and extract uploads-relative path when absolute filesystem path is stored.
  const normalized = trimmed.replace(/\\/g, '/');
  const uploadsIndex = normalized.toLowerCase().indexOf('uploads/');

  if (uploadsIndex >= 0) {
    const uploadsPath = normalized.slice(uploadsIndex);
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://sa-b8f7feda25334cddb6709bee5393ffbd.ecs.ap-southeast-2.on.aws/api';
    const baseUrl = backendUrl.replace('/api', '');
    return `${baseUrl}/${uploadsPath}`;
  }

  // If already app-relative path, ensure it starts with '/'.
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
