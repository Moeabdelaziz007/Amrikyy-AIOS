import { supabase, uploadFile, downloadFile, deleteFile as deleteStorageFile } from '../packages/supabase/src';

/**
 * File Service
 * Handles all file operations including storage and metadata management
 */

export interface FileMetadata {
  id: string;
  user_id: string;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

const FILE_BUCKET = 'user-files';

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get all file metadata for a user
 */
export async function getUserFiles(userId: string): Promise<FileMetadata[]> {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get files in a specific folder
 */
export async function getFilesInFolder(userId: string, folderId: string | null): Promise<FileMetadata[]> {
  let query = supabase
    .from('file_metadata')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching files:', error);
    throw error;
  }

  return data || [];
}

/**
 * Upload a file to storage and save metadata
 */
export async function uploadUserFile(
  userId: string,
  file: File,
  folderId?: string
): Promise<FileMetadata> {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  // Upload to storage
  await uploadFile({
    bucket: FILE_BUCKET,
    path: filePath,
    file,
    upsert: false,
  });

  // Save metadata
  const { data, error } = await supabase
    .from('file_metadata')
    .insert({
      user_id: userId,
      name: file.name,
      path: filePath,
      size: file.size,
      mime_type: file.type,
      folder_id: folderId || null,
    })
    .select()
    .single();

  if (error) {
    // Clean up storage if metadata save fails
    await deleteStorageFile(FILE_BUCKET, filePath).catch(console.error);
    console.error('Error saving file metadata:', error);
    throw error;
  }

  return data;
}

/**
 * Download a file from storage
 */
export async function downloadUserFile(fileMetadata: FileMetadata): Promise<Blob> {
  const blob = await downloadFile({
    bucket: FILE_BUCKET,
    path: fileMetadata.path,
  });

  return blob;
}

/**
 * Delete a file from storage and metadata
 */
export async function deleteUserFile(fileId: string, filePath: string): Promise<void> {
  // Delete from storage
  await deleteStorageFile(FILE_BUCKET, filePath);

  // Delete metadata
  const { error } = await supabase
    .from('file_metadata')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('Error deleting file metadata:', error);
    throw error;
  }
}

/**
 * Get a single file by ID
 */
export async function getFile(id: string): Promise<FileMetadata | null> {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching file:', error);
    throw error;
  }

  return data;
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  id: string,
  updates: Partial<Omit<FileMetadata, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<FileMetadata> {
  const { data, error } = await supabase
    .from('file_metadata')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }

  return data;
}
