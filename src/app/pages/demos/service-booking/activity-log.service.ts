import { Injectable } from '@angular/core';
import { ActivityEvent } from './activity-log.model';

/**
 * Service for managing activity log events for quote requests
 * Provides timeline tracking for customer portal
 */
@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly STORAGE_KEY = 'kcws_booking_activity_v1';

  /**
   * Safe read from localStorage with error handling
   */
  private safeRead(): ActivityEvent[] {
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
  private safeWrite(events: ActivityEvent[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('Failed to save activity events to localStorage:', err);
    }
  }

  /**
   * Generate a unique ID for an activity event
   */
  private generateId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all activity events for a specific request, sorted chronologically (oldest first)
   */
  getEventsForRequest(requestId: string): ActivityEvent[] {
    const events = this.safeRead();
    return events
      .filter((e) => e.requestId === requestId)
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }

  /**
   * Append a new activity event
   */
  appendEvent(event: Omit<ActivityEvent, 'id'>): void {
    const events = this.safeRead();
    const newEvent: ActivityEvent = {
      ...event,
      id: this.generateId(),
    };
    events.push(newEvent);
    this.safeWrite(events);
  }

  /**
   * Log request creation event
   */
  logCreated(requestId: string, timestamp?: string): void {
    this.appendEvent({
      requestId,
      type: 'created',
      message: 'Request submitted',
      timestamp: timestamp || new Date().toISOString(),
    });
  }

  /**
   * Log status change event
   */
  logStatusChange(requestId: string, fromStatus: string, toStatus: string): void {
    this.appendEvent({
      requestId,
      type: 'status-change',
      message: `Status changed: ${fromStatus} → ${toStatus}`,
      timestamp: new Date().toISOString(),
      metadata: { fromStatus, toStatus },
    });
  }

  /**
   * Log appointment booking event
   */
  logAppointmentBooked(requestId: string, date: string, time: string): void {
    const formattedDate = this.formatDate(date);
    const formattedTime = this.formatTime(time);
    this.appendEvent({
      requestId,
      type: 'appointment-booked',
      message: `Appointment booked for ${formattedDate} at ${formattedTime}`,
      timestamp: new Date().toISOString(),
      metadata: { appointmentDate: date, appointmentTime: time },
    });
  }

  /**
   * Log appointment rescheduling event
   */
  logAppointmentRescheduled(
    requestId: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string
  ): void {
    const oldFormatted = `${this.formatDate(oldDate)} at ${this.formatTime(oldTime)}`;
    const newFormatted = `${this.formatDate(newDate)} at ${this.formatTime(newTime)}`;
    this.appendEvent({
      requestId,
      type: 'appointment-rescheduled',
      message: `Appointment rescheduled from ${oldFormatted} to ${newFormatted}`,
      timestamp: new Date().toISOString(),
      metadata: { appointmentDate: newDate, appointmentTime: newTime },
    });
  }

  /**
   * Log appointment cancellation event
   */
  logAppointmentCanceled(requestId: string): void {
    this.appendEvent({
      requestId,
      type: 'appointment-canceled',
      message: 'Appointment canceled',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log attachment added event
   */
  logAttachmentAdded(requestId: string, fileName: string): void {
    this.appendEvent({
      requestId,
      type: 'attachment-added',
      message: `Attachment added: ${fileName}`,
      timestamp: new Date().toISOString(),
      metadata: { fileName },
    });
  }

  /**
   * Log quote created/sent event
   */
  logQuoteCreated(requestId: string): void {
    this.appendEvent({
      requestId,
      type: 'quote-created',
      message: 'Quote sent to customer',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log a custom note event
   */
  logNote(requestId: string, note: string): void {
    this.appendEvent({
      requestId,
      type: 'note',
      message: note,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Format date for display (e.g., "Tue, Jan 14")
   */
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${weekday}, ${month} ${day}`;
  }

  /**
   * Format time for display (e.g., "10:30 AM")
   */
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Backfill activity events for requests that don't have any
   * Should be called on app init to ensure all requests have at least a "created" event
   */
  backfillMissingEvents(requests: Array<{ id: string; createdAt: string }>): void {
    const existingEvents = this.safeRead();
    const requestsWithEvents = new Set(existingEvents.map((e) => e.requestId));

    requests.forEach((request) => {
      if (!requestsWithEvents.has(request.id)) {
        this.logCreated(request.id, request.createdAt);
      }
    });
  }
}
