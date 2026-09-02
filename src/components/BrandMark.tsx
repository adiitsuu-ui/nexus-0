import React from 'react';

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'h-8 w-8' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3.2 26.4 7.4v9.4c0 6.05-4.35 10.95-10.4 12.8C10 27.75 5.6 22.85 5.6 16.8V7.4L16 3.2Z"
        fill="#152433"
        stroke="#C9A86C"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M16 10.4v7.4"
        stroke="#C9A86C"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="20.6" r="1.35" fill="#C9A86C" />
    </svg>
  );
};

export default BrandMark;
