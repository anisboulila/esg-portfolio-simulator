import { Component, input } from '@angular/core';

@Component({
  selector: 'app-detail-section',
  templateUrl: './detail-section.html',
  styleUrl: './detail-section.css',
})
export class DetailSection {
  readonly title = input.required<string>();
}