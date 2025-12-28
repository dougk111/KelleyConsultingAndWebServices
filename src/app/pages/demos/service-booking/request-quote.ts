import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteRequestService } from '../../../services/quote-request.service';

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './request-quote.html',
  styleUrl: './request-quote.css',
})
export class RequestQuote {
  protected form: FormGroup;
  protected submitting = false;
  protected formSubmitted = false;
  protected error: string | null = null;
  protected showEmailQueued = false;

  protected readonly serviceTypes = [
    'Plumbing',
    'Landscaping',
    'Electrical',
    'HVAC',
    'Cleaning',
    'Other',
  ];

  constructor(private fb: FormBuilder, private svc: QuoteRequestService, private router: Router) {
    this.form = this.fb.group({
      serviceType: ['', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: [''],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      details: ['', [Validators.required, Validators.minLength(20)]],
      preferredDateFrom: [''],
      preferredDateTo: [''],
    });
  }

  protected submit() {
    this.formSubmitted = true;
    this.error = null;
    if (this.form.invalid) return;
    this.submitting = true;
    const payload = { ...this.form.value } as Omit<any, 'id' | 'createdAt' | 'status'>;
    this.svc.create(payload).subscribe({
      next: (rec) => {
        this.submitting = false;
        this.showEmailQueued = true;
        // navigate to confirmation page with id
        this.router.navigate(['/demos/service-booking/request-quote/confirm', rec.id]);
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.error = 'There was an issue submitting your request. Please try again.';
      },
    });
  }
}
