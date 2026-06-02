// Posts are authored with an America/Sao_Paulo (-03:00) wall-clock date.
// Format in that fixed zone so the rendered day is stable regardless of where
// the build runs (local vs. UTC CI) and matches the date the author wrote.
const TZ = 'America/Sao_Paulo';

export const isoDay = (d: Date): string =>
  d.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

export const humanDay = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
