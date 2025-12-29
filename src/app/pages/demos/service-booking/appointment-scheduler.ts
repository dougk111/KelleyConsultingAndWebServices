import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from './appointment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Appointment } from './appointment.model';

@Component({
  selector: 'app-appointment-scheduler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-scheduler.html',
  styleUrl: './appointment-scheduler.css',
})
export class AppointmentScheduler {
  @Input() requestId!: string;

  protected days: { label: string; iso: string }[] = [];
  protected selectedDate: string | null = null;
  protected slots: { time: string; available: boolean; reason?: string }[] = [];
  protected selectedTime: string | null = null;
  protected submitting = false;
  protected error: string | null = null;

  constructor(private svc: AppointmentService, private router: Router, private route: ActivatedRoute) {
    this.buildDays();
    this.selectedDate = this.days[0].iso;
    this.loadSlots(this.selectedDate);
  }

  protected buildDays() {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      days.push({ label, iso });
    }
    this.days = days;
  }

  protected loadSlots(dateIso?: string) {
    this.selectedTime = null;
    this.slots = [];
    const dateToUse = dateIso || this.selectedDate!;
    if (!dateToUse) return;
    this.slots = this.svc.getAvailableSlots(dateToUse);
    this.selectedDate = dateToUse;
  }

  protected pickDate(iso: string) {
    this.loadSlots(iso);
  }

  protected pickTime(t: string) {
    this.selectedTime = t;
  }

  protected confirm() {
    this.error = null;
    if (!this.selectedDate || !this.selectedTime) {
      this.error = 'Please select a date and time slot.';
      return;
    }
    this.submitting = true;
    const appt: Appointment = {
      requestId: this.requestId,
      date: this.selectedDate,
      time: this.selectedTime,
      status: 'booked',
      createdAt: new Date().toISOString(),
    };
    this.svc.saveAppointment(appt).subscribe({
      next: () => {
        this.submitting = false;
        // add a query param to force parent reload
        this.router.navigate([], { relativeTo: this.route, queryParams: { t: Date.now() }, queryParamsHandling: 'merge' });
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to save appointment.';
        this.submitting = false;
      },
    });
  }
}
