import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'demo-small-business-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class SmallBusinessServices implements OnInit {
  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Services — Example Local Service Company');
    this.meta.updateTag({ name: 'description', content: 'Services offered by Example Local Service Company.' });
  }
}
