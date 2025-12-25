import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  protected readonly technologies = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'HTML5 & CSS3',
    'Responsive Design',
    'RESTful APIs',
    'Git',
    'Node.js',
    'SQL & NoSQL Databases',
    'Cloud Platforms',
  ];

  protected readonly expertise = [
    {
      area: 'Frontend Development',
      description:
        'Modern, responsive web applications using Angular and other contemporary frameworks.',
    },
    {
      area: 'UI/UX Design',
      description:
        'User-centered design that balances aesthetics with functionality and accessibility.',
    },
    {
      area: 'Web Architecture',
      description:
        'Scalable, maintainable application structures built with best practices in mind.',
    },
    {
      area: 'Performance Optimization',
      description: 'Fast-loading, efficient applications that provide excellent user experiences.',
    },
  ];
    constructor(private title: Title, private meta: Meta) {}

    ngOnInit(): void {
      this.title.setTitle('About — Kelley Consulting & Web Services');
      this.meta.updateTag({ name: 'description', content: 'About Kelley Consulting & Web Services.' });
    }
  }
