import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'demo-small-business-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class SmallBusinessHome implements OnInit {
  protected readonly company = 'Example Local Service Company';
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Small Business Demo — ' + this.company);
    this.meta.updateTag({ name: 'description', content: 'A simple brochure demo site for a local service business.' });
  }
}
