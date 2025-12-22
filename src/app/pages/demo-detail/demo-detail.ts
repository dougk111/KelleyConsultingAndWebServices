import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface DemoContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  techStack: string[];
  highlights: string[];
}

@Component({
  selector: 'app-demo-detail',
  imports: [RouterLink],
  templateUrl: './demo-detail.html',
  styleUrl: './demo-detail.css',
})
export class DemoDetail implements OnInit {
  protected readonly demo = signal<DemoContent | null>(null);

  private readonly demoData: Record<string, DemoContent> = {
    'small-business': {
      id: 'small-business',
      title: 'Small Business Brochure Site',
      subtitle: 'Professional Marketing Website',
      description:
        'A comprehensive marketing website designed to help small businesses establish a strong online presence. This demo showcases a clean, professional design with strategic calls-to-action, service highlights, and customer engagement tools.',
      features: [
        'Mobile-responsive design that looks great on all devices',
        'Hero section with compelling value proposition',
        'Detailed service pages with benefits and pricing',
        'Customer testimonials and social proof',
        'Contact form with validation',
        'Google Maps integration for location',
        'SEO-optimized page structure',
      ],
      techStack: ['Angular', 'TypeScript', 'CSS Grid & Flexbox', 'Responsive Design'],
      highlights: [
        'Fast load times with optimized assets',
        'Accessible design following WCAG guidelines',
        'Easy-to-navigate structure',
        'Clear conversion paths for visitors',
      ],
    },
    'service-booking': {
      id: 'service-booking',
      title: 'Service Booking & Quote System',
      subtitle: 'Interactive Booking Application',
      description:
        'A user-friendly web application that streamlines the booking process for service-based businesses. Customers can browse services, select time slots, and request quotes all in one intuitive interface.',
      features: [
        'Interactive service catalog with filtering',
        'Calendar-based appointment scheduling',
        'Multi-step quote request form',
        'Customer account dashboard',
        'Booking confirmation and reminders',
        'Service provider availability management',
        'Price calculator based on selected services',
      ],
      techStack: ['Angular', 'TypeScript', 'Reactive Forms', 'Angular Router', 'RxJS'],
      highlights: [
        'Intuitive user experience with guided workflows',
        'Real-time form validation and feedback',
        'Dynamic pricing calculations',
        'Responsive design for mobile booking',
      ],
    },
    'admin-dashboard': {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Portal',
      subtitle: 'Business Intelligence & Management',
      description:
        'A powerful administrative dashboard that provides business insights through data visualization and comprehensive management tools. Designed for efficiency and ease of use.',
      features: [
        'Interactive data visualization charts',
        'User and role management interface',
        'Real-time analytics and metrics',
        'Content management system',
        'Activity logs and audit trails',
        'Export functionality for reports',
        'Customizable dashboard widgets',
      ],
      techStack: [
        'Angular',
        'TypeScript',
        'Chart.js/D3.js',
        'Angular Material',
        'Reactive Programming',
      ],
      highlights: [
        'Clean, modern interface design',
        'Data-driven decision making tools',
        'Performance-optimized for large datasets',
        'Modular architecture for extensibility',
      ],
    },
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      const demoContent = this.demoData[id];
      this.demo.set(demoContent || null);
    });
  }
}
