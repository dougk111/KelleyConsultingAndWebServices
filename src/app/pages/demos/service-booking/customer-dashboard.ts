import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { QuoteRequest } from '../../../models/quote-request';
import { RequestRepositoryService } from './request-repository.service';
import { ActivityLogService } from './activity-log.service';

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css'],
})
export class CustomerDashboard implements OnInit {
  requests = signal<QuoteRequest[]>([]);
  filteredRequests = signal<QuoteRequest[]>([]);
  selectedStatus = signal<string>('All');
  searchQuery = signal<string>('');
  highlightedRequestId = signal<string | null>(null);

  readonly statusOptions = ['All', 'Submitted', 'In Review', 'Scheduled', 'Quoted', 'Closed'];

  constructor(
    private requestRepo: RequestRepositoryService,
    private activityLog: ActivityLogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.backfillActivityEvents();
    this.handleHighlightParam();
  }

  /**
   * Handle highlight query param to emphasize newly created request
   */
  private handleHighlightParam(): void {
    this.route.queryParams.subscribe((params) => {
      const highlightId = params['highlight'];
      if (highlightId) {
        this.highlightedRequestId.set(highlightId);
        // Auto-clear highlight after 3 seconds
        setTimeout(() => {
          this.highlightedRequestId.set(null);
        }, 3000);
        // Scroll to highlighted element after DOM renders
        setTimeout(() => {
          const element = document.getElementById(`request-${highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    });
  }

  /**
   * Load all requests from storage
   */
  private loadRequests(): void {
    const allRequests = this.requestRepo.getAllRequests();
    this.requests.set(allRequests);
    this.applyFilters();
  }

  /**
   * Backfill missing activity events for existing requests
   */
  private backfillActivityEvents(): void {
    const allRequests = this.requestRepo.getAllRequests();
    this.activityLog.backfillMissingEvents(
      allRequests.map((r) => ({ id: r.id, createdAt: r.createdAt }))
    );
  }

  /**
   * Apply status and search filters
   */
  private applyFilters(): void {
    let filtered = this.requests();

    // Status filter
    if (this.selectedStatus() !== 'All') {
      filtered = filtered.filter((r) => r.status === this.selectedStatus());
    }

    // Search filter (by request ID)
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((r) => r.id.toLowerCase().includes(query));
    }

    this.filteredRequests.set(filtered);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.applyFilters();
  }

  /**
   * Handle search input change
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  /**
   * Get status badge CSS class
   */
  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      Submitted: 'status-submitted',
      'In Review': 'status-in-review',
      Scheduled: 'status-scheduled',
      Quoted: 'status-quoted',
      Closed: 'status-closed',
    };
    return classMap[status] || 'status-default';
  }

  /**
   * Format date for display
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Format appointment preview
   */
  formatAppointment(request: QuoteRequest): string {
    if (!request.appointment || request.appointment.status === 'canceled') {
      return 'No appointment';
    }
    const date = new Date(request.appointment.date);
    const [hours, minutes] = request.appointment.time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
