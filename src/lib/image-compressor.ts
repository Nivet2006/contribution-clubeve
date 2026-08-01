/**
 * Utility to compress image files / Data URLs using HTML Canvas.
 * Resizes image down to maxDimensions (e.g., max 800px width/height)
 * and compresses using quality factor (e.g. 0.75 in WEBP/JPEG format).
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export function compressImage(
  fileOrDataUrl: File | string,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      if (width === 0 || height === 0) {
        reject(new Error('Invalid image dimensions'));
        return;
      }

      // Calculate constrained dimensions keeping aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }

      // Smooth scaling settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed WebP/JPEG data URL
      let dataUrl = canvas.toDataURL(mimeType, quality);
      
      // Fallback if browser doesn't support requested mimeType
      if (!dataUrl.startsWith(`data:${mimeType}`)) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(dataUrl);
    };

    img.onerror = (err) => reject(err);
    img.onload = processImage;

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
