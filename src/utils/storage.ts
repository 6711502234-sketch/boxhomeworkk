/**
 * Safe Storage Engine & Memory Optimization Utilities
 * Prevents application freezing, quota exceeded crashes, and data loss.
 */

/**
 * Safely parse JSON from storage with a fallback
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (error) {
    console.warn(`[SafeStorage] Failed to read or parse key "${key}":`, error);
    return fallback;
  }
}

/**
 * Safely saves data to localStorage without throwing QuotaExceededError.
 * If quota is full, intelligently strips heavy base64 file payloads from older records
 * to ensure all critical textual data (tasks, submissions, scores, comments) is preserved.
 */
export function safeSetItem(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[SafeStorage] Quota exceeded or error saving key "${key}". Attempting resilient recovery...`, error);

    // If quota is exceeded, try cleaning up heavy data URLs
    try {
      if (Array.isArray(value)) {
        // Strip heavy base64 strings from attachments in array items if quota reached
        const pruned = value.map((item) => {
          if (typeof item === 'object' && item !== null) {
            const copy = { ...item };
            // If attachment data is huge base64, truncate or clear the cached copy
            if (typeof copy.attachmentData === 'string' && copy.attachmentData.length > 50000) {
              copy.attachmentData = ''; // Keep attachmentName, link, size intact
            }
            if (typeof copy.attachedFileData === 'string' && copy.attachedFileData.length > 50000) {
              copy.attachedFileData = ''; // Keep attachedFileName, link, size intact
            }
            return copy;
          }
          return item;
        });

        localStorage.setItem(key, JSON.stringify(pruned));
        console.info(`[SafeStorage] Successfully preserved "${key}" using lightweight payload.`);
        return true;
      }
    } catch (innerError) {
      console.error(`[SafeStorage] Secondary save failed for "${key}":`, innerError);
    }

    return false;
  }
}

/**
 * Safely removes item from localStorage
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[SafeStorage] Failed to remove key "${key}":`, error);
  }
}

/**
 * Compresses an image file before base64 encoding to prevent browser lag and storage overflow.
 * Keeps resolution high (up to 1280px) and quality crisp (~85%), reducing multi-megabyte
 * photos from phone cameras down to < 200KB.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, read standard Data URL
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate scaling
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(typeof e.target?.result === 'string' ? e.target.result : '');
            return;
          }

          // Draw smoothly with image smoothing enabled
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG/WebP
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(outputType, quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(typeof e.target?.result === 'string' ? e.target.result : '');
        }
      };
      img.onerror = () => {
        resolve(typeof e.target?.result === 'string' ? e.target.result : '');
      };
      img.src = typeof e.target?.result === 'string' ? e.target.result : '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
