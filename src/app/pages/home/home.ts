import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DemoCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly demos: DemoCard[] = [
    {
      id: 'small-business',
      title: 'Small Business Brochure',
      description:
        'A professional marketing website for local businesses, featuring service listings, contact forms, and compelling calls-to-action.',
      tags: ['Marketing', 'Responsive', 'SEO-Optimized'],
    },
    {
      id: 'service-booking',
      title: 'Service Booking System',
      description:
        'An intuitive booking interface for service-based businesses, with appointment scheduling, quote requests, and customer management.',
      tags: ['Interactive', 'User-Friendly', 'Modern UI'],
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      description:
        'A comprehensive admin portal with data visualization, reporting, and content management capabilities for business operations.',
      tags: ['Analytics', 'Data Visualization', 'Management'],
    },
  ];
}
