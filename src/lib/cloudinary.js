/**
 * ⚜️ SHEMSOU BOUTIQUE - Cloudinary Media Engine & Compression
 * Handles automatic media uploads (photos/short videos), URL optimization (f_auto, q_auto),
 * and space cleanup when items are manually deleted by the Admin.
 */

const STORAGE_KEY = 'shemsou_cloudinary_config';

export function getCloudinaryConfig() {
  // localStorage may hold an admin override. Ignore known-wrong cloud names
  // (e.g. the old "shemsou"/"shemsou-boutique") so uploads always use the
  // correct build-time environment (unfpes6r) instead of a stale bad value.
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (
        parsed &&
        parsed.cloudName &&
        parsed.cloudName !== 'shemsou' &&
        parsed.cloudName !== 'shemsou-boutique'
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse Cloudinary config', e);
  }
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'unfpes6r',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'shemsou',
    apiKey: ''
  };
}

export function saveCloudinaryConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save Cloudinary config', e);
    return false;
  }
}

/**
 * Upload an image or short video directly to Cloudinary
 * @param {File} file - The file object from file input
 * @param {string} folder - Destination folder
 * @returns {Promise<{ url: string, public_id: string, resource_type: string, is_local?: boolean }>}
 */
export async function uploadMedia(file, folder = 'shemsou_boutique') {
  if (!file) throw new Error('No file provided');

  const config = getCloudinaryConfig();
  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  // Size guard: Max 10MB for images, 35MB for videos
  const maxBytes = isVideo ? 35 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(isVideo ? 'حجم الفيديو يجب ألا يتجاوز 35 ميجابايت' : 'حجم الصورة يجب ألا يتجاوز 10 ميجابايت');
  }

  // Base64 fallback (used when Cloudinary is not configured OR when an upload fails)
  const toBase64 = () =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          public_id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          resource_type: resourceType,
          is_local: true
        });
      };
      reader.onerror = () => reject(new Error('فشل قراءة الملف محلياً'));
      reader.readAsDataURL(file);
    });

  // If cloud name & preset are configured, attempt upload to Cloudinary API
  if (config.cloudName && config.uploadPreset && config.cloudName !== 'shemsou-boutique') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'فشل رفع الملف إلى Cloudinary');
      }

      const data = await response.json();
      return {
        url: data.secure_url || data.url,
        public_id: data.public_id,
        resource_type: data.resource_type || resourceType,
        width: data.width,
        height: data.height,
        format: data.format,
        is_local: false
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local preview:', err);
      return toBase64();
    }
  }

  // Fallback / Instant preview mode (base64 DataURL) when credentials are not yet configured
  return toBase64();
}

/**
 * Extract the Cloudinary public_id from a full delivery URL.
 * Handles both raw and transformed URLs.
 * @param {string} url
 * @returns {string|null}
 */
export function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;
  const clean = url.split('?')[0];
  const marker = '/upload/';
  const idx = clean.indexOf(marker);
  if (idx === -1) return null;
  let pid = clean.slice(idx + marker.length);
  pid = pid.replace(/^v\d+\//, ''); // strip version segment
  pid = pid.replace(/\.[a-z0-9]+$/i, ''); // strip extension
  return pid;
}

/**
 * Delete a media asset from Cloudinary when the admin explicitly deletes a
 * product or image. Routes the request to the serverless endpoint which uses
 * server-only credentials, so the asset is actually removed (freeing quota).
 * @param {string} publicIdOrUrl - Cloudinary public_id OR delivery URL
 * @param {string} resourceType - 'image' | 'video'
 */
export async function deleteMediaFromCloudinary(publicIdOrUrl, resourceType = 'image') {
  if (!publicIdOrUrl || typeof publicIdOrUrl !== 'string') {
    return { success: true, skipped: true };
  }
  if (publicIdOrUrl.startsWith('local_') || !publicIdOrUrl.includes('cloudinary.com')) {
    // Local preview or external stock image — nothing to delete on Cloudinary
    return { success: true, skipped: true };
  }

  const publicId = extractCloudinaryPublicId(publicIdOrUrl) || publicIdOrUrl;

  try {
    const res = await fetch('/api/cloudinary-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error || `HTTP ${res.status}`;
      console.warn('Cloudinary delete failed:', msg);
      return { success: false, error: msg };
    }
  } catch (e) {
    console.warn('Cloudinary delete call failed:', e);
    return { success: false, error: e.message };
  }

  return { success: true, deletedId: publicId };
}

/**
 * Apply automatic format and quality compression to Cloudinary URLs (f_auto, q_auto)
 */
export function optimizeMediaUrl(url, { width = null, height = null, crop = null } = {}) {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com') || url.startsWith('data:')) {
    return url;
  }

  // Insert transformations into Cloudinary URL
  let transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}
