import React from 'react';

// Note: HomeIcon is not currently used in the application,
// but this file is created for architectural consistency.
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a.75.75 0 0 1 1.06 0l8.955 8.955M3 10.5v.75A5.25 5.25 0 0 0 8.25 21h7.5A5.25 5.25 0 0 0 21 15.75v-.75m-18 0V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v3.75m-18 0h18" />
  </svg>
);
