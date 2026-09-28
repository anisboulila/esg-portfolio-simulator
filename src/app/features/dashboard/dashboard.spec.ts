import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  it('should render the computed portfolio summary', async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const summary = fixture.nativeElement as HTMLElement;
    expect(summary.querySelector('h1')?.textContent).toContain('Dashboard');
    const sections = summary.querySelectorAll('app-detail-section');
    expect(sections).toHaveLength(2);
    expect(sections[0]?.textContent).toContain('3');
    expect(sections[0]?.textContent).toContain('1250000');
    expect(sections[1]?.textContent).toContain('78 / 100');
  });
});