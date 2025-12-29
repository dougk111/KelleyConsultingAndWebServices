import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteRequestService } from '../../../services/quote-request.service';
import { QuoteRequest } from '../../../models/quote-request';
import { AppointmentService } from './appointment.service';
import { AppointmentScheduler } from './appointment-scheduler';
import { AppointmentSummary } from './appointment-summary';
import { Appointment } from './appointment.model';

@Component({
  selector: 'app-request-confirm',
  standalone: true,
  imports: [CommonModule, AppointmentScheduler, AppointmentSummary],
  templateUrl: './request-confirm.html',
  styleUrl: './request-confirm.css',
})
export class RequestConfirm {
  protected loading = true;
  protected request: QuoteRequest | undefined;
  protected notFound = false;
  protected appointment: Appointment | undefined;
  protected showScheduler = false;

  constructor(
    private route: ActivatedRoute,
    private svc: QuoteRequestService,
    private apptSvc: AppointmentService,
    private router: Router
  ) {
    // subscribe to route params and query params so we can refresh when scheduler updates query params
    this.route.params.subscribe((p) => this.load(p['id']));
    this.route.queryParams.subscribe(() => {
      const id = this.route.snapshot.params['id'];
      if (id) this.loadAppointment(id);
    });
  }

  private load(id?: string) {
    const requestId = id || this.route.snapshot.params['id'] || this.route.snapshot.queryParamMap.get('id') || '';
    if (!requestId) {
      this.loading = false;
      this.notFound = true;
      return;
    }
    this.loading = true;
    this.svc.getById(requestId).subscribe((r) => {
      this.request = r;
      this.loading = false;
      this.notFound = !r;
      if (r) this.loadAppointment(r.id);
    });
  }

  private loadAppointment(requestId: string) {
    this.apptSvc.getAppointment(requestId).subscribe((a) => {
      this.appointment = a;
      this.showScheduler = false;
    });
  }

  protected openScheduler() {
    this.showScheduler = true;
    // clear query param that may be set
    this.router.navigate([], { queryParams: { view: null }, queryParamsHandling: 'merge' });
  }
}
