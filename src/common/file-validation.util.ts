import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
];

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  jpeg: [new Uint8Array([0xff, 0xd8, 0xff])],
  png: [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  gif: [
    new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
    new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
  ],
  webp: [
    new Uint8Array([0x52, 0x49, 0x46, 0x46]), // RIFF
  ],
  pdf: [new Uint8Array([0x25, 0x50, 0x44, 0x46])], // %PDF
};

export function checkExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function checkMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime);
}

export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename);
  const name = path
    .basename(filename, ext)
    .replace(/[^a-zA-Z0-9\-_\u0600-\u06FF\s]/g, '')
    .trim()
    .slice(0, 100);
  return name || 'file';
}

export async function validateMagicBytes(
  filePath: string,
): Promise<{ valid: boolean; ext: string }> {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  if (!ext || ext === 'svg') {
    return { valid: true, ext }; // SVG is text-based, skip magic byte check
  }

  const signatures = MAGIC_BYTES[ext];
  if (!signatures) return { valid: false, ext };

  const fd = await fs.promises.open(filePath, 'r');
  try {
    const needed = Math.max(...signatures.map((s) => s.byteLength));
    const buf = new Uint8Array(needed);
    await fd.read(buf, 0, needed, 0);

    const matched = signatures.some((sig) =>
      sig.every((byte, i) => buf[i] === byte),
    );

    if (!matched) {
      await fd.close();
      await fs.promises.unlink(filePath);
      return { valid: false, ext };
    }

    return { valid: true, ext };
  } finally {
    await fd.close();
  }
}

export async function validateSvgSafety(filePath: string): Promise<boolean> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const dangerous = /<script[\s>]|on\w+=["']?javascript:|onerror=|onload=/i;
    if (dangerous.test(content)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function validateUploadedFile(
  filePath: string,
): Promise<{ ok: boolean; error?: string }> {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');

  if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
    await fs.promises.unlink(filePath);
    return { ok: false, error: 'File extension not allowed' };
  }

  const { valid } = await validateMagicBytes(filePath);
  if (!valid) {
    return { ok: false, error: 'File content does not match extension' };
  }

  if (ext === 'svg') {
    const safe = await validateSvgSafety(filePath);
    if (!safe) {
      await fs.promises.unlink(filePath);
      return { ok: false, error: 'SVG contains unsafe content' };
    }
  }

  return { ok: true };
}
