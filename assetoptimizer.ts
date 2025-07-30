export const optimizeImage = async (imageFile: File): Promise<Blob> => {
  const settings = getOptimizationSettings();

  if (settings.webpEnabled && imageFile.type.startsWith('image/')) {
    try {
      return await convertToWebP(imageFile);
    } catch (error) {
      console.error('WebP conversion failed, falling back to standard compression:', error);
    }
  }

  return new Promise((resolve, reject) => {
    new Compressor(imageFile, {
      quality: settings.imageQuality,
      success: resolve,
      error: reject
    });
  });
};

export const compressAsset = async (asset: File): Promise<Blob> => {
  const settings = getOptimizationSettings();
  const zip = new JSZip();

  if (asset.type.startsWith('text/') || [
    'application/font-woff',
    'font/woff2',
    'application/font-sfnt',
    'font/ttf',
    'font/otf'
  ].includes(asset.type)) {
    zip.file(asset.name, asset);
    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: settings.zipLevel }
    });
  }
  return asset;
};

const checkWebPSupportSync = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL) {
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 1, 1);
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const getOptimizationSettings = (): OptimizationSettings => {
  const webpSupported = checkWebPSupportSync();
  const defaultSettings = {
    imageQuality: 0.8,
    webpEnabled: webpSupported,
    zipLevel: 6
  };

  try {
    const stored = localStorage.getItem('optimizationSettings');
    const storedSettings = stored ? JSON.parse(stored) : {};
    const mergedSettings = { ...defaultSettings, ...storedSettings };
    mergedSettings.webpEnabled = mergedSettings.webpEnabled && webpSupported;
    return mergedSettings;
  } catch {
    return defaultSettings;
  }
};

export const convertToWebP = async (source: File|Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const url = URL.createObjectURL(source);

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject('WebP conversion failed');
        }, 'image/webp', getOptimizationSettings().imageQuality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('Image loading error');
    };
    
    img.src = url;
  });
};