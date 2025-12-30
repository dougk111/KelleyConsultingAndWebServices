import { Injectable } from '@angular/core';
import { Attachment } from './attachment.model';

/**
 * Service for managing mock file attachments (metadata only)
 * NOTE: This is front-end only - no actual files are stored
 */
@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly STORAGE_KEY = 'kcws_booking_attachments_v1';

  /**
   * Safe read from localStorage with error handling
   */
  private safeRead(): Attachment[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Safe write to localStorage with error handling
   */
  private safeWrite(attachments: Attachment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attachments));
    } catch (err) {
      console.error('Failed to save attachments to localStorage:', err);
    }
  }

  /**
   * Generate a unique ID for an attachment
   */
  private generateId(): string {
    return `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all attachments for a specific request, sorted by upload date (newest first)
   */
  getAttachments(requestId: string): Attachment[] {
    const attachments = this.safeRead();
    return attachments
      .filter((a) => a.requestId === requestId)
      .sort((a, b) => {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
  }

  /**
   * Add a new attachment (metadata only)
   */
  addAttachment(
    requestId: string,
    fileMeta: {
      fileName: string;
      fileType: string;
      fileSizeKb: number;
      note?: string;
    }
  ): Attachment {
    const attachments = this.safeRead();
    const newAttachment: Attachment = {
      id: this.generateId(),
      requestId,
      fileName: fileMeta.fileName,
      fileType: fileMeta.fileType,
      fileSizeKb: fileMeta.fileSizeKb,
      uploadedAt: new Date().toISOString(),
      note: fileMeta.note,
    };
    attachments.push(newAttachment);
    this.safeWrite(attachments);
    return newAttachment;
  }

  /**
   * Remove an attachment by ID
   */
  removeAttachment(requestId: string, attachmentId: string): void {
    const attachments = this.safeRead();
    const filtered = attachments.filter(
      (a) => !(a.id === attachmentId && a.requestId === requestId)
    );
    this.safeWrite(filtered);
  }

  /**
   * Get total count of attachments for a request
   */
  getAttachmentCount(requestId: string): number {
    return this.getAttachments(requestId).length;
  }
}
