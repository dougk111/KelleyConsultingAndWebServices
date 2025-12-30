import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuoteRequest } from '../../../models/quote-request';
import { ActivityEvent } from './activity-log.model';
import { Attachment } from './attachment.model';
import { RequestRepositoryService } from './request-repository.service';
import { ActivityLogService } from './activity-log.service';
import { AttachmentService } from './attachment.service';

@Component({
  selector: 'app-customer-request-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-request-detail.html',
  styleUrls: ['./customer-request-detail.css'],
})
export class CustomerRequestDetail implements OnInit {
  request = signal<QuoteRequest | null>(null);
  activityEvents = signal<ActivityEvent[]>([]);
  attachments = signal<Attachment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  uploadError = signal<string | null>(null);

  // Status simulation for demo
  showStatusSimulator = signal(false);
  readonly statusOptions: Array<'Submitted' | 'In Review' | 'Scheduled' | 'Quoted' | 'Closed'> = [
    'Submitted',
    'In Review',
    'Scheduled',
    'Quoted',
    'Closed',
  ];

  constructor(
    private route: ActivatedRoute,
    private requestRepo: RequestRepositoryService,
    private activityLog: ActivityLogService,
    private attachmentService: AttachmentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const requestId = params['id'];
      if (requestId) {
        this.loadRequestDetail(requestId);
      }
    });
  }

  /**
   * Load request, activity events, and attachments
   */
  private loadRequestDetail(requestId: string): void {
    this.loading.set(true);
    this.error.set(null);

    const request = this.requestRepo.getRequestById(requestId);
    if (!request) {
      this.error.set('Request not found');
      this.loading.set(false);
      return;
    }

    this.request.set(request);
    this.activityEvents.set(this.activityLog.getEventsForRequest(requestId));
    this.attachments.set(this.attachmentService.getAttachments(requestId));
    this.loading.set(false);
  }

  /**
   * Simulate status change (demo feature)
   */
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as QuoteRequest['status'];
    const request = this.request();

    if (!request || request.status === newStatus) {
      return;
    }

    const oldStatus = request.status;
    this.requestRepo.updateRequestStatus(request.id, newStatus);
    this.activityLog.logStatusChange(request.id, oldStatus, newStatus);

    // Reload to reflect changes
    this.loadRequestDetail(request.id);
  }

  /**
   * Simulate quote sent (demo feature)
   */
  onSimulateQuoteSent(): void {
    const request = this.request();
    if (!request) return;

    const oldStatus = request.status;
    this.requestRepo.updateRequestStatus(request.id, 'Quoted');
    this.activityLog.logQuoteCreated(request.id);
    if (oldStatus !== 'Quoted') {
      this.activityLog.logStatusChange(request.id, oldStatus, 'Quoted');
    }

    this.loadRequestDetail(request.id);
  }

  /**
   * Handle mock file upload
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.uploadError.set(null);

    // Validate file size (max 5MB for demo)
    const maxSizeKb = 5 * 1024;
    const fileSizeKb = Math.round(file.size / 1024);

    if (fileSizeKb > maxSizeKb) {
      this.uploadError.set('File size exceeds 5MB limit');
      input.value = '';
      return;
    }

    const request = this.request();
    if (!request) return;

    // Add mock attachment metadata
    const attachment = this.attachmentService.addAttachment(request.id, {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSizeKb,
    });

    // Log activity
    this.activityLog.logAttachmentAdded(request.id, file.name);

    // Reload attachments
    this.attachments.set(this.attachmentService.getAttachments(request.id));
    this.activityEvents.set(this.activityLog.getEventsForRequest(request.id));

    // Clear input
    input.value = '';
  }

  /**
   * Remove attachment
   */
  onRemoveAttachment(attachmentId: string): void {
    const request = this.request();
    if (!request) return;

    this.attachmentService.removeAttachment(request.id, attachmentId);
    this.attachments.set(this.attachmentService.getAttachments(request.id));
  }

  /**
   * Get status badge CSS class
   */
  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      Submitted: 'status-submitted',
      'In Review': 'status-in-review',
      Scheduled: 'status-scheduled',
      Quoted: 'status-quoted',
      Closed: 'status-closed',
    };
    return classMap[status] || 'status-default';
  }

  /**
   * Format date for display
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Format timestamp for timeline
   */
  formatTimestamp(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  /**
   * Format appointment details
   */
  formatAppointment(request: QuoteRequest): string {
    if (!request.appointment || request.appointment.status === 'canceled') {
      return 'Not scheduled';
    }
    const date = new Date(request.appointment.date);
    const [hours, minutes] = request.appointment.time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return `${formattedDate} at ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Format file size for display
   */
  formatFileSize(kb: number): string {
    if (kb < 1024) {
      return `${kb} KB`;
    }
    const mb = (kb / 1024).toFixed(2);
    return `${mb} MB`;
  }

  /**
   * Get activity event icon class
   */
  getEventIconClass(type: string): string {
    const iconMap: Record<string, string> = {
      created: 'icon-created',
      'status-change': 'icon-status',
      'appointment-booked': 'icon-calendar',
      'appointment-rescheduled': 'icon-calendar',
      'appointment-canceled': 'icon-cancel',
      'quote-created': 'icon-quote',
      note: 'icon-note',
      'attachment-added': 'icon-attachment',
    };
    return iconMap[type] || 'icon-default';
  }
}
