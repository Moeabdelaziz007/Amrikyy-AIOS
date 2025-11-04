import { supabase } from './client';
import type { FileObject } from '@supabase/supabase-js';

/**
 * Storage Service
 * Handles file uploads, downloads, and management
 */

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface DownloadOptions {
  bucket: string;
  path: string;
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(options: UploadOptions) {
  const { bucket, path, file, contentType, cacheControl = '3600', upsert = false } = options;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || file.type,
      cacheControl,
      upsert,
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Download file from Supabase storage
 */
export async function downloadFile(options: DownloadOptions) {
  const { bucket, path } = options;

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Create signed URL for private file access
 */
export async function createSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * List files in a bucket
 */
export async function listFiles(bucket: string, path: string = ''): Promise<FileObject[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, paths: string | string[]) {
  const pathsArray = Array.isArray(paths) ? paths : [paths];

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(pathsArray);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Move/rename file
 */
export async function moveFile(bucket: string, fromPath: string, toPath: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create storage bucket
 */
export async function createBucket(name: string, isPublic: boolean = false) {
  const { data, error } = await supabase.storage
    .createBucket(name, {
      public: isPublic,
    });

  if (error) {
    throw error;
  }

  return data;
}
