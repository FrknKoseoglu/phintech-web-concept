import { isMidasBrand, BRAND_LOGO_COLOR } from '@/lib/brand-config';

/**
 * Midas Logo SVG Component
 */
export function MidasLogo({ className }: { className?: string }) {
  return (
    <svg
      width="60"
      height="38.3"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 62.7 38.3"
      xmlSpace="preserve"
      className={className}
    >
      <style type="text/css">{`.st0{fill:${BRAND_LOGO_COLOR};}`}</style>
      <ellipse
        transform="matrix(0.1797 -0.9837 0.9837 0.1797 -25.2876 32.4364)"
        className="st0"
        cx="6.8"
        cy="31.4"
        rx="6.9"
        ry="6.8"
      />
      <path
        className="st0"
        d="M11.8,1l-1.3,0.6c-0.1,0.1-0.3,0.2-0.4,0.3C10,2,10,2.2,9.9,2.3c0,0.1-0.1,0.3-0.1,0.4c0,0.2,0,0.3,0.1,0.4
        L24,32.5c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.1-0.1,0.3-0.2,0.4-0.3s0.2-0.2,0.2-0.4
        s0.1-0.3,0.1-0.4s0-0.3-0.1-0.4L24.7,5.5c-0.6-1.2-1.3-2.2-2.3-3S20.3,1,19.2,0.5C18,0.1,16.7-0.1,15.4,0C14.2,0.1,12.9,0.4,11.8,1z"
      />
      <path
        className="st0"
        d="M35.6,1l-1.3,0.6C34,1.8,33.8,2,33.7,2.3s-0.1,0.6,0.1,0.9l14.1,29.3c0.6,1.2,1.3,2.2,2.3,3
        s2.1,1.5,3.2,1.9s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.3-0.1,0.5-0.4,0.6-0.7s0.1-0.6-0.1-0.9L48.5,5.5c-0.6-1.2-1.3-2.2-2.3-3S44.2,1,43,0.5
        c-1.2-0.4-2.5-0.6-3.7-0.5C38,0.1,36.7,0.4,35.6,1z"
      />
    </svg>
  );
}

/**
 * PhinTech Logo SVG Component
 */
export function PhinTechLogo({ className }: { className?: string }) {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="phintech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      
      {/* Upward growth arrow with tech lines */}
      <path
        d="M 20 80 L 35 50 L 50 60 L 75 20 L 80 25 L 75 30"
        stroke="url(#phintech-gradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Arrow head */}
      <path
        d="M 80 25 L 75 20 L 70 15 L 75 20 L 85 18 L 80 25 Z"
        fill="url(#phintech-gradient)"
      />
      
      {/* Tech node points */}
      <circle cx="20" cy="80" r="5" fill="#14B8A6" />
      <circle cx="35" cy="50" r="5" fill="#14B8A6" />
      <circle cx="50" cy="60" r="5" fill="#14B8A6" />
      <circle cx="75" cy="20" r="5" fill="#14B8A6" />
      
      {/* Abstract "P" shape */}
      <path
        d="M 15 25 L 15 45 M 15 25 Q 30 25 30 35 Q 30 45 15 45"
        stroke="url(#phintech-gradient)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Brand Logo Component
 * Automatically renders the correct logo based on PROJECT_CLONE_NAME
 */
export default function BrandLogo({ className }: { className?: string }) {
  if (isMidasBrand()) {
    return <MidasLogo className={className} />;
  }
  return <PhinTechLogo className={className} />;
}
