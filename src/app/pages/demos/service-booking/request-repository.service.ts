import { Injectable } from '@angular/core';
import { QuoteRequest } from '../../../models/quote-request';

/**
 * Repository service for managing quote requests in localStorage
 * Provides unified access to request data for the customer portal
 */
@Injectable({ providedIn: 'root' })
export class RequestRepositoryService {
  private readonly STORAGE_KEY = 'kcws_quote_requests';

  /**
   * Safe read from localStorage with error handling
   */
  private safeRead(): QuoteRequest[] {
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
  private safeWrite(requests: QuoteRequest[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    } catch (err) {
      console.error('Failed to save requests to localStorage:', err);
    }
  }

  /**
   * Get all quote requests, sorted by created date (newest first)
   */
  getAllRequests(): QuoteRequest[] {
    const requests = this.safeRead();
    return requests.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Get a single request by ID
   */
  getRequestById(id: string): QuoteRequest | null {
    const requests = this.safeRead();
    return requests.find((r) => r.id === id) || null;
  }

  /**
   * Update request status and updatedAt timestamp
   */
  updateRequestStatus(
    id: string,
    status: 'Submitted' | 'In Review' | 'Scheduled' | 'Quoted' | 'Closed'
  ): void {
    const requests = this.safeRead();
    const index = requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      requests[index].updatedAt = new Date().toISOString();
      this.safeWrite(requests);
    }
  }

  /**
   * Save or update a request
   */
  saveRequest(request: QuoteRequest): void {
    const requests = this.safeRead();
    const index = requests.findIndex((r) => r.id === request.id);
    if (index !== -1) {
      requests[index] = { ...request, updatedAt: new Date().toISOString() };
    } else {
      requests.push(request);
    }
    this.safeWrite(requests);
  }

  /**
   * Attach appointment data to a request and update status to Scheduled
   */
  attachAppointment(requestId: string, appointment: any): void {
    const requests = this.safeRead();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index].appointment = appointment;
      // Auto-update status to Scheduled if not already Quoted or Closed
      if (
        requests[index].status === 'Submitted' ||
        requests[index].status === 'In Review'
      ) {
        requests[index].status = 'Scheduled';
      }
      requests[index].updatedAt = new Date().toISOString();
      this.safeWrite(requests);
    }
  }

  /**
   * Remove appointment from a request (e.g., after cancellation)
   */
  detachAppointment(requestId: string): void {
    const requests = this.safeRead();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      delete requests[index].appointment;
      // Revert status to In Review if was Scheduled
      if (requests[index].status === 'Scheduled') {
        requests[index].status = 'In Review';
      }
      requests[index].updatedAt = new Date().toISOString();
      this.safeWrite(requests);
    }
  }
}
