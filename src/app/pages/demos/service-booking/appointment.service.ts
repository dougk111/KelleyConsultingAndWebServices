import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Appointment } from './appointment.model';
import { ActivityLogService } from './activity-log.service';
import { RequestRepositoryService } from './request-repository.service';

const STORAGE_KEY = 'kcws_booking_appointments_v1';

function safeRead(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Appointment[];
  } catch (e) {
    console.error('Failed to read appointments', e);
    return [];
  }
}

function safeWrite(items: Appointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write appointments', e);
  }
}

function dateHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private activityLog = inject(ActivityLogService);
  private requestRepo = inject(RequestRepositoryService);

  getAppointment(requestId: string): Observable<Appointment | undefined> {
    const items = safeRead();
    const found = items.find((a) => a.requestId === requestId);
    return of(found).pipe(delay(200));
  }

  saveAppointment(appointment: Appointment): Observable<Appointment> {
    const items = safeRead();
    const existingIndex = items.findIndex((a) => a.requestId === appointment.requestId && a.status === 'booked');
    const isReschedule = existingIndex >= 0;
    const oldAppointment = isReschedule ? items[existingIndex] : null;

    if (isReschedule) {
      items[existingIndex] = { ...items[existingIndex], ...appointment, updatedAt: new Date().toISOString() };
    } else {
      items.push({ ...appointment, createdAt: new Date().toISOString(), status: 'booked' });
    }
    safeWrite(items);

    return of(appointment).pipe(
      delay(300),
      tap((apt) => {
        // Update request with appointment and set status to Scheduled
        this.requestRepo.attachAppointment(apt.requestId, apt);

        // Log appropriate activity event
        if (isReschedule && oldAppointment) {
          this.activityLog.logAppointmentRescheduled(
            apt.requestId,
            oldAppointment.date,
            oldAppointment.time,
            apt.date,
            apt.time
          );
        } else {
          this.activityLog.logAppointmentBooked(apt.requestId, apt.date, apt.time);
        }
      })
    );
  }

  cancelAppointment(requestId: string): Observable<boolean> {
    const items = safeRead();
    const idx = items.findIndex((a) => a.requestId === requestId && a.status === 'booked');
    if (idx >= 0) {
      items[idx].status = 'canceled';
      items[idx].updatedAt = new Date().toISOString();
      safeWrite(items);

      // Update request and log activity
      this.requestRepo.detachAppointment(requestId);
      this.activityLog.logAppointmentCanceled(requestId);

      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(100));
  }

  rescheduleAppointment(requestId: string, newDate: string, newTime: string): Observable<Appointment | undefined> {
    const items = safeRead();
    const idx = items.findIndex((a) => a.requestId === requestId && a.status === 'booked');
    if (idx >= 0) {
      const oldDate = items[idx].date;
      const oldTime = items[idx].time;

      items[idx].date = newDate;
      items[idx].time = newTime;
      items[idx].updatedAt = new Date().toISOString();
      safeWrite(items);

      const updatedAppointment = items[idx];

      // Update request and log activity
      this.requestRepo.attachAppointment(requestId, updatedAppointment);
      this.activityLog.logAppointmentRescheduled(requestId, oldDate, oldTime, newDate, newTime);

      return of(updatedAppointment).pipe(delay(250));
    }
    return of(undefined).pipe(delay(100));
  }

  getAvailableSlots(dateIso: string): { time: string; available: boolean; reason?: string }[] {
    // Working days Mon-Fri only
    const date = new Date(dateIso + 'T00:00:00');
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const slots: { time: string; available: boolean; reason?: string }[] = [];
    if (isWeekend) {
      return slots;
    }

    // slots every 30 minutes from 09:00 to 15:30
    const startHour = 9;
    const endHour = 16; // exclusive
    const times: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`);
      times.push(`${String(h).padStart(2, '0')}:30`);
    }
    // remove the 16:00 slot if any
    times.pop();

    // block lunch 12:00 and 12:30
    const lunchSet = new Set(['12:00', '12:30']);

    // deterministic random blocking based on dateHash
    const seed = dateHash(dateIso);
    const rng = (i: number) => ((seed >> i) & 0xff) / 255;
    // decide 2-4 blocked slots
    const blockCount = 2 + (seed % 3); // 2,3,4
    const blockedIdx: number[] = [];
    let i = 0;
    while (blockedIdx.length < blockCount && i < times.length) {
      const idx = Math.floor(rng(i) * times.length);
      if (!blockedIdx.includes(idx) && !lunchSet.has(times[idx])) blockedIdx.push(idx);
      i++;
    }

    // get today's date/time for past blocking
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    for (let t of times) {
      let available = true;
      let reason: string | undefined;
      if (lunchSet.has(t)) {
        available = false;
        reason = 'Lunch';
      }
      const idx = times.indexOf(t);
      if (blockedIdx.includes(idx)) {
        available = false;
        reason = 'Unavailable';
      }
      // block past times if date is today
      if (dateIso === todayIso) {
        const [hh, mm] = t.split(':').map((s) => parseInt(s, 10));
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
        if (slotDate <= now) {
          available = false;
          reason = 'Past';
        }
      }
      slots.push({ time: t, available, reason });
    }

    return slots;
  }
}
