import fs from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 700) =>
  fs.readFileSync(
    require.resolve(
      `@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff`,
    ),
  );
const fonts = [
  { name: 'JetBrains Mono', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: font(700), weight: 700 as const, style: 'normal' as const },
];

// Same palette as the dark theme in global.css.
const BG = '#0e0e0e';
const FG = '#e4e4e4';
const MUTED = '#777777';
const RULE = '#232323';

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

/** Renders a 1200x630 social preview card as PNG. */
export async function renderOgImage({ title, meta }: { title: string; meta?: string }) {
  const titleSize = title.length > 60 ? 54 : title.length > 35 ? 64 : 76;
  const svg = await satori(
    h(
      'div',
      {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: BG,
        color: FG,
        fontFamily: 'JetBrains Mono',
        borderBottom: `12px solid ${RULE}`,
      },
      [
        h('div', { display: 'flex', fontSize: 30, color: MUTED }, meta ?? ''),
        h(
          'div',
          { display: 'flex', fontSize: titleSize, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
          title,
        ),
        h(
          'div',
          { display: 'flex', justifyContent: 'space-between', fontSize: 30, color: MUTED },
          [h('div', { display: 'flex', color: FG }, 'krymancer.dev'), h('div', { display: 'flex' }, '@joaodocodigo')],
        ),
      ],
    ) as any,
    { width: 1200, height: 630, fonts },
  );
  return new Resvg(svg).render().asPng();
}

/** First paragraph of a markdown body as plain text, for meta descriptions. */
export function excerpt(markdown: string | undefined, max = 180) {
  const para =
    (markdown ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^(#|<|!\[|```|>|---)/.test(p)) ?? '';
  const text = para
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}
