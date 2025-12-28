export interface Appointment {
  requestId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  status: 'booked' | 'canceled';
  createdAt: string;
  updatedAt?: string;
}
