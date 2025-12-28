import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from './appointment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Appointment } from './appointment.model';

@Component({
  selector: 'app-appointment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-summary.html',
  styleUrl: './appointment-summary.css',
})
export class AppointmentSummary {
  @Input() appointment?: Appointment;
  @Input() requestId?: string;

  protected cancelling = false;
  protected rescheduling = false;

  constructor(private svc: AppointmentService, private router: Router, private route: ActivatedRoute) {}

  protected cancel() {
    if (!this.requestId) return;
    this.cancelling = true;
    this.svc.cancelAppointment(this.requestId).subscribe(() => {
      this.cancelling = false;
      // force parent refresh via query param
      this.router.navigate([], { relativeTo: this.route, queryParams: { t: Date.now() }, queryParamsHandling: 'merge' });
    });
  }

  protected reschedule() {
    // parent will show scheduler; use query param to indicate reschedule
    this.router.navigate([], { relativeTo: this.route, queryParams: { view: 'reschedule', t: Date.now() }, queryParamsHandling: 'merge' });
  }
}
