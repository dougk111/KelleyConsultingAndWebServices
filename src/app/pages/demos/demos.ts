import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Demo {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
}

@Component({
  selector: 'app-demos',
  imports: [RouterLink],
  templateUrl: './demos.html',
  styleUrl: './demos.css',
})
export class Demos {
  protected readonly demos: Demo[] = [
    {
      id: 'small-business',
      title: 'Small Business Brochure Site',
      description:
        'A professional marketing website designed for local businesses to showcase their services, highlight their value proposition, and capture customer inquiries.',
      category: 'Marketing Website',
      features: [
        'Responsive design',
        'Service showcase',
        'Contact forms',
        'Call-to-action sections',
        'SEO-optimized structure',
      ],
    },
    {
      id: 'service-booking',
      title: 'Service Booking & Quote System',
      description:
        'An interactive booking interface that allows customers to schedule appointments, request quotes, and manage their service requests with an intuitive user experience.',
      category: 'Web Application',
      features: [
        'Appointment scheduling',
        'Quote request forms',
        'Service catalog',
        'Customer dashboard',
        'Email notifications',
      ],
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Portal',
      description:
        'A comprehensive administrative interface with data visualization, reporting capabilities, and content management tools for efficient business operations.',
      category: 'Dashboard Application',
      features: [
        'Data visualization charts',
        'User management',
        'Analytics and reporting',
        'Content management',
        'Real-time updates',
      ],
    },
  ];
}
