import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => (
  <svg fill="none" strokeWidth={1.5} stroke="currentColor" {...props}>
    <use href={`#icon-${name}`} />
  </svg>
);
