import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { QuoteRequest } from '../models/quote-request';
import { ActivityLogService } from '../pages/demos/service-booking/activity-log.service';

const STORAGE_KEY = 'kcws_quote_requests';

function safeReadStorage(): QuoteRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuoteRequest[];
  } catch (e) {
    console.error('Failed to read quote requests from storage', e);
    return [];
  }
}

function safeWriteStorage(items: QuoteRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write quote requests to storage', e);
  }
}

function generateId(existing: QuoteRequest[]): string {
  const year = new Date().getFullYear();
  const last = existing
    .map((r) => {
      const m = r.id.match(/REQ-(\d{4})-(\d{4})/);
      return m ? parseInt(m[2], 10) : 0;
    })
    .sort((a, b) => b - a)[0] || 0;
  const next = (last || 0) + 1;
  const num = String(next).padStart(4, '0');
  return `REQ-${year}-${num}`;
}

@Injectable({ providedIn: 'root' })
export class QuoteRequestService {
  private activityLog = inject(ActivityLogService);

  create(request: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>): Observable<QuoteRequest> {
    const existing = safeReadStorage();
    const id = generateId(existing);
    const createdAt = new Date().toISOString();
    const record: QuoteRequest = { ...request, id, createdAt, status: 'Submitted' };

    // Simulate failure when email contains 'fail'
    const willFail = (request.customerEmail || '').toLowerCase().includes('fail') || Math.random() < 0.05;

    const latency = 500 + Math.floor(Math.random() * 400);

    if (willFail) {
      return throwError(() => new Error('Simulated network error')).pipe(delay(latency));
    }

    existing.push(record);
    safeWriteStorage(existing);

    // Log activity event for request creation
    return of(record).pipe(
      delay(latency),
      tap((req) => this.activityLog.logCreated(req.id, req.createdAt))
    );
  }

  getById(id: string): Observable<QuoteRequest | undefined> {
    const existing = safeReadStorage();
    const found = existing.find((r) => r.id === id);
    // small delay for UX
    return of(found).pipe(delay(300));
  }

  // helper for tests / debug
  listAll(): QuoteRequest[] {
    return safeReadStorage();
  }
}
