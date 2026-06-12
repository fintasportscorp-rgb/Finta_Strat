import React from 'react';

interface RichTextProps {
  html: string;
  className?: string;
  as?: 'p' | 'span' | 'li';
}

/** Renders a translation string that contains static inline markup (<strong>, <em>, <br>). */
const RichText: React.FC<RichTextProps> = ({ html, className, as: Tag = 'p' }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

export default RichText;
