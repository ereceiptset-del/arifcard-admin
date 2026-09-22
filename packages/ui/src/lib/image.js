/**
 * Client-side image handling for identity uploads.
 *
 * Files are read into memory and, when oversized, downscaled with a canvas
 * before being sent to the API. Nothing is written to browser storage at
 * any point.
 */

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isAcceptedImage(file) {
  return ACCEPTED_IMAGE_TYPES.includes(file?.type);
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file is not a readable image."));
    image.src = dataUrl;
  });
}

/** Rough byte size of a base64 data URL payload. */
function dataUrlBytes(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Returns `{ name, size, dataUrl }` no larger than `maxBytes`.
 *
 * Oversized images are downscaled and re-encoded as JPEG in a few passes.
 * If it still will not fit, this throws rather than silently sending a
 * file the API will reject.
 */
export async function prepareImage(file, { maxBytes = 500 * 1024, maxDimension = 1600 } = {}) {
  if (!isAcceptedImage(file)) {
    throw new Error("Choose a JPG, PNG or WebP image.");
  }

  const originalDataUrl = await readAsDataUrl(file);
  if (file.size <= maxBytes) {
    return { name: file.name, size: file.size, dataUrl: originalDataUrl, compressed: false };
  }

  const image = await loadImage(originalDataUrl);
  let width = image.width;
  let height = image.height;

  const longestSide = Math.max(width, height);
  if (longestSide > maxDimension) {
    const scale = maxDimension / longestSide;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  for (const quality of [0.82, 0.68, 0.55, 0.42]) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);

    const candidate = canvas.toDataURL("image/jpeg", quality);
    const size = dataUrlBytes(candidate);
    if (size <= maxBytes) {
      const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
      return { name, size, dataUrl: candidate, compressed: true };
    }

    // Shrink further before the next quality pass.
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
  }

  throw new Error("That image is too large to compress under 500 KB. Try a smaller photo.");
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
