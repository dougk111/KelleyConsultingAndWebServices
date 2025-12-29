import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.model';

describe('AppointmentService', () => {
  let service: AppointmentService;
  const STORAGE_KEY = 'kcws_booking_appointments_v1';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AppointmentService] });
    service = TestBed.inject(AppointmentService);
    localStorage.removeItem(STORAGE_KEY);
  });

  it('returns no slots on weekends', () => {
    // find next Sunday
    const now = new Date();
    const daysToSunday = (7 - now.getDay()) % 7;
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday);
    const iso = sunday.toISOString().slice(0, 10);
    const slots = service.getAvailableSlots(iso);
    expect(slots.length).toBe(0);
  });

  it('blocks lunch slots (12:00 & 12:30)', () => {
    // next Monday
    const now = new Date();
    let daysToMonday = (1 - now.getDay() + 7) % 7;
    if (daysToMonday === 0) daysToMonday = 7;
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToMonday);
    const iso = mon.toISOString().slice(0, 10);
    const slots = service.getAvailableSlots(iso);
    const lunch = slots.filter((s) => s.time === '12:00' || s.time === '12:30');
    expect(lunch.length).toBe(2);
    expect(lunch.every((s) => !s.available && s.reason === 'Lunch')).toBe(true);
  });

  it('deterministically blocks the same slots for the same date', () => {
    const now = new Date();
    let daysToMonday = (1 - now.getDay() + 7) % 7;
    if (daysToMonday === 0) daysToMonday = 7;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToMonday);
    const iso = d.toISOString().slice(0, 10);
    const a = service.getAvailableSlots(iso);
    const b = service.getAvailableSlots(iso);
    expect(a.length).toBe(b.length);
    expect(a.map((s) => s.available).join(',')).toEqual(b.map((s) => s.available).join(','));
  });

  it('saves, loads, reschedules and cancels appointments (async)', (done: any) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const appt: Appointment = {
      requestId: 'TST-1',
      date: todayIso,
      time: '09:00',
      status: 'booked',
      createdAt: new Date().toISOString(),
    };

    service.saveAppointment(appt).subscribe(() => {
      service.getAppointment('TST-1').subscribe((loaded) => {
        expect(loaded).toBeDefined();
        expect(loaded!.status).toBe('booked');

        const nd = new Date();
        nd.setDate(nd.getDate() + 1);
        const newIso = nd.toISOString().slice(0, 10);

        service.rescheduleAppointment('TST-1', newIso, '10:00').subscribe((rescheduled) => {
          expect(rescheduled).toBeDefined();
          expect(rescheduled!.date).toBe(newIso);

          service.getAppointment('TST-1').subscribe((loaded2) => {
            expect(loaded2).toBeDefined();
            expect(loaded2!.date).toBe(newIso);

            service.cancelAppointment('TST-1').subscribe((ok) => {
              expect(ok).toBe(true);

              service.getAppointment('TST-1').subscribe((loaded3) => {
                expect(loaded3).toBeDefined();
                expect(loaded3!.status).toBe('canceled');
                done();
              });
            });
          });
        });
      });
    });
  });
});
