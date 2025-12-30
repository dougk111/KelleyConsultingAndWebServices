/**
 * Attachment metadata for mock file uploads
 * NOTE: This is front-end only - no actual files are stored
 */
export interface Attachment {
  id: string;
  requestId: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string; // ISO format
  note?: string;
}
