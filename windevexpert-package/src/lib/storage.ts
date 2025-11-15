import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'

export interface UploadResult {
  url: string
  path: string
  name: string
}

export class StorageService {
  // Upload a file to Firebase Storage
  static async uploadFile(
    file: File,
    path: string,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const name = fileName || `${Date.now()}_${file.name}`
      const fullPath = `${path}/${name}`
      const storageRef = ref(storage, fullPath)
      
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      
      return {
        url,
        path: fullPath,
        name
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  // Upload multiple files
  static async uploadFiles(
    files: File[],
    path: string
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, path)
      )
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading files:', error)
      throw new Error('Failed to upload files')
    }
  }

  // Delete a file from Firebase Storage
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Get download URL for a file
  static async getFileURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Error getting file URL:', error)
      throw new Error('Failed to get file URL')
    }
  }

  // List all files in a directory
  static async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)
      
      const urls = await Promise.all(
        result.items.map(item => getDownloadURL(item))
      )
      
      return urls
    } catch (error) {
      console.error('Error listing files:', error)
      throw new Error('Failed to list files')
    }
  }

  // Generate a unique file name
  static generateFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    
    if (prefix) {
      return `${prefix}_${timestamp}_${randomString}.${extension}`
    }
    
    return `${timestamp}_${randomString}.${extension}`
  }

  // Validate file type
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  // Validate file size (in MB)
  static validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }
}