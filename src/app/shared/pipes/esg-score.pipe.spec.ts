import { EsgScorePipe } from './esg-score.pipe';

describe('EsgScorePipe', () => {
  const pipe = new EsgScorePipe();

  it('should display a score with two decimal places', () => {
    expect(pipe.transform(82)).toBe('82.00');
  });

  it('should format decimals without changing the source score', () => {
    const score = 82.456;

    expect(pipe.transform(score)).toBe('82.46');
    expect(score).toBe(82.456);
  });

  it('should format zero as a score', () => {
    expect(pipe.transform(0)).toBe('0.00');
  });
});