import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

interface Service {
  title: string;
  description: string;
  features: string[];
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit {
  protected readonly services: Service[] = [
    {
      title: 'Custom Web Development',
      description:
        'Tailored web applications built with modern technologies to meet your specific business requirements.',
      features: [
        'Responsive design for all devices',
        'Modern frontend frameworks',
        'Scalable architecture',
        'Performance optimization',
      ],
    },
    {
      title: 'Business Websites',
      description:
        'Professional websites that establish your online presence and attract customers.',
      features: [
        'Professional design',
        'Content management systems',
        'SEO optimization',
        'Contact and inquiry forms',
      ],
    },
    {
      title: 'Web Applications',
      description:
        'Interactive web applications that streamline your business processes and improve efficiency.',
      features: [
        'User authentication and authorization',
        'Data management and reporting',
        'Integration with third-party services',
        'Admin dashboards and controls',
      ],
    },
    {
      title: 'Consulting & Support',
      description:
        'Expert guidance and ongoing support to ensure your web presence remains effective and up-to-date.',
      features: [
        'Technical consultation',
        'Architecture planning',
        'Performance audits',
        'Maintenance and updates',
      ],
    },
  ];

  protected readonly processSteps: ProcessStep[] = [
    {
      step: 1,
      title: 'Discovery',
      description:
        'We discuss your goals, requirements, and vision to understand your business needs.',
    },
    {
      step: 2,
      title: 'Planning',
      description:
        'We create a detailed project plan, including timeline, milestones, and technical approach.',
    },
    {
      step: 3,
      title: 'Development',
      description:
        'Our team builds your solution using best practices and modern technologies.',
    },
    {
      step: 4,
      title: 'Delivery',
      description:
        'We deploy your solution, provide training, and ensure a smooth handoff.',
    },
  ];

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Services — Kelley Consulting & Web Services');
    this.meta.updateTag({ name: 'description', content: 'Services offered by Kelley Consulting & Web Services.' });
  }
}

