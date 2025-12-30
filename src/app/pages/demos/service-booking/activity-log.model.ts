/**
 * Activity event types for request tracking timeline
 */
export type ActivityEventType =
  | 'created'
  | 'status-change'
  | 'appointment-booked'
  | 'appointment-rescheduled'
  | 'appointment-canceled'
  | 'quote-created'
  | 'note'
  | 'attachment-added';

/**
 * Represents a single activity event in a request's timeline
 */
export interface ActivityEvent {
  id: string;
  requestId: string;
  type: ActivityEventType;
  message: string;
  timestamp: string; // ISO format
  metadata?: {
    fromStatus?: string;
    toStatus?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    fileName?: string;
  };
}
