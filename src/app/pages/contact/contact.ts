import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly email = 'info@KelleyConsultingWebServices.com';
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Contact — Kelley Consulting & Web Services');
    this.meta.updateTag({ name: 'description', content: 'Contact Kelley Consulting & Web Services.' });
  }
}
