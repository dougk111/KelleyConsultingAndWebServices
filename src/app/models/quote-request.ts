import { Appointment } from '../pages/demos/service-booking/appointment.model';

export interface QuoteRequest {
  id: string;
  serviceType: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  details: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  createdAt: string;
  status: 'Submitted' | 'In Review' | 'Scheduled' | 'Quoted' | 'Closed';
  appointment?: Appointment;
}
