import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'demo-small-business-contact',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class SmallBusinessContact {
  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('Contact — Example Local Service Company');
    this.meta.updateTag({ name: 'description', content: 'Contact Example Local Service Company.' });
  }

  protected submitForm(e: Event) {
    e.preventDefault();
    this.error.set(null);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const message = (fd.get('message') || '').toString().trim();
    const bot = (fd.get('bot-field') || '').toString().trim();

    if (bot) {
      this.error.set('Spam detected.');
      return;
    }
    if (!name || !email || !message) {
      this.error.set('Please fill required fields.');
      return;
    }
    const emailRx = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRx.test(email)) {
      this.error.set('Please enter a valid email.');
      return;
    }

    this.loading.set(true);
    // Simulated submit (replace with Netlify Forms endpoint if desired)
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
      console.log('Demo contact submission:', { name, email, message });
      form.reset();
    }, 900);
  }
}
