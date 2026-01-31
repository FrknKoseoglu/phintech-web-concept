import { ImageResponse } from 'next/og';
import { isMidasBrand } from '@/lib/brand-config';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Image generation for Apple touch icon
export default function AppleIcon() {
  const isMidas = isMidasBrand();
  const color = isMidas ? '#4E55FF' : '#14B8A6';
  const bgColor = isMidas ? '#1a1a2e' : '#0f1419';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: bgColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        {isMidas ? (
          // Midas Logo
          <svg width="120" height="120" viewBox="0 0 62.7 38.3" xmlns="http://www.w3.org/2000/svg">
            <ellipse transform="matrix(0.1797 -0.9837 0.9837 0.1797 -25.2876 32.4364)" fill={color} cx="6.8" cy="31.4" rx="6.9" ry="6.8"/>
            <path fill={color} d="M11.8,1l-1.3,0.6c-0.1,0.1-0.3,0.2-0.4,0.3C10,2,10,2.2,9.9,2.3c0,0.1-0.1,0.3-0.1,0.4c0,0.2,0,0.3,0.1,0.4 L24,32.5c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.1-0.1,0.3-0.2,0.4-0.3s0.2-0.2,0.2-0.4 s0.1-0.3,0.1-0.4s0-0.3-0.1-0.4L24.7,5.5c-0.6-1.2-1.3-2.2-2.3-3S20.3,1,19.2,0.5C18,0.1,16.7-0.1,15.4,0C14.2,0.1,12.9,0.4,11.8,1z"/>
            <path fill={color} d="M35.6,1l-1.3,0.6C34,1.8,33.8,2,33.7,2.3s-0.1,0.6,0.1,0.9l14.1,29.3c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9 s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.3-0.1,0.5-0.4,0.6-0.7s0.1-0.6-0.1-0.9L48.5,5.5c-0.6-1.2-1.3-2.2-2.3-3S44.2,1,43,0.5 c-1.2-0.4-2.5-0.6-3.7-0.5C38,0.1,36.7,0.4,35.6,1z"/>
          </svg>
        ) : (
          // PhinTech Logo
          <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 10 L 70 40 L 60 40 L 60 70 L 40 70 L 40 40 L 30 40 Z" fill={color}/>
            <circle cx="25" cy="80" r="4" fill={color}/>
            <circle cx="50" cy="85" r="4" fill={color}/>
            <circle cx="75" cy="80" r="4" fill={color}/>
            <line x1="25" y1="80" x2="50" y2="70" stroke={color} strokeWidth="2" opacity="0.5"/>
            <line x1="75" y1="80" x2="50" y2="70" stroke={color} strokeWidth="2" opacity="0.5"/>
          </svg>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
