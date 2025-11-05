import React from 'react';

// Note: ThumbsDownIcon is not currently used in the application,
// but this file is created for architectural consistency.
export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533.422 2.031 1.08a9.041 9.041 0 0 1 2.861 2.4c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 0 0 .322 1.672V21a.75.75 0 0 1-.75.75A2.25 2.25 0 0 1 13.5 21v-2.154c0-.414-.21-.79-.528-1.005-1.454-.772-2.756-2.242-3.298-4.03a.75.75 0 0 1 .42-1.005l.353-.176c.86-.43 1.737-.75 2.651-.975v-.008c.375-.362.625-.864.625-1.41a2.25 2.25 0 0 1 2.25-2.25H16.5a2.25 2.25 0 0 1 2.25 2.25v9.75A2.25 2.25 0 0 1 16.5 21h-.001c-.621 0-1.22-.218-1.694-.604a1.861 1.861 0 0 0-.98-1.106c-.343-.172-.695-.31-1.05-.409-.356-.1-.71-.196-1.064-.292V13.5c1.158.28 2.327.518 3.5.687V9" />
    </svg>
);
