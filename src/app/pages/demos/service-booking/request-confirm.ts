import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteRequestService } from '../../../services/quote-request.service';
import { QuoteRequest } from '../../../models/quote-request';

@Component({
  selector: 'app-request-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-confirm.html',
  styleUrl: './request-confirm.css',
})
export class RequestConfirm {
  protected loading = true;
  protected request: QuoteRequest | undefined;
  protected notFound = false;

  constructor(private route: ActivatedRoute, private svc: QuoteRequestService, private router: Router) {
    const id = this.route.snapshot.params['id'] || this.route.snapshot.queryParamMap.get('id') || '';
    if (!id) {
      this.loading = false;
      this.notFound = true;
      return;
    }
    this.svc.getById(id).subscribe((r) => {
      this.request = r;
      this.loading = false;
      this.notFound = !r;
    });
  }
}
