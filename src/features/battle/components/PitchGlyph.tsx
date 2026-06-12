import React from 'react';

interface PitchGlyphProps {
  formation: string;
  className?: string;
}

/**
 * Mini tactics-board glyph: player dots laid out per formation string
 * ("4-2-3-1" → GK + 4 rows of dots on a tiny pitch, defense at the bottom).
 */
const PitchGlyph: React.FC<PitchGlyphProps> = ({ formation, className = '' }) => {
  const rows = formation
    .split('-')
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const width = 28;
  const height = 36;
  const bandCount = Math.max(rows.length - 1, 1);

  const dots: Array<{ x: number; y: number }> = [{ x: width / 2, y: height - 4.5 }]; // GK
  rows.forEach((count, rowIdx) => {
    const y = height - 10 - (rowIdx * (height - 16)) / bandCount;
    for (let i = 0; i < count; i++) {
      dots.push({ x: ((i + 1) * width) / (count + 1), y });
    }
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <rect
        x="0.75"
        y="0.75"
        width={width - 1.5}
        height={height - 1.5}
        rx="3"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />
      <line
        x1="1"
        y1={height / 2}
        x2={width - 1}
        y2={height / 2}
        stroke="var(--border)"
        strokeWidth="1"
      />
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r="1.7" fill="var(--accent)" />
      ))}
    </svg>
  );
};

export default PitchGlyph;
