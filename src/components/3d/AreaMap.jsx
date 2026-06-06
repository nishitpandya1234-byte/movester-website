import React, { useState } from 'react'

const CITIES = [
  { name: 'Toronto', cx: 62, cy: 65 },
  { name: 'Mississauga', cx: 55, cy: 68 },
  { name: 'Brampton', cx: 52, cy: 60 },
  { name: 'Scarborough', cx: 67, cy: 62 },
  { name: 'North York', cx: 61, cy: 58 },
  { name: 'Ajax', cx: 73, cy: 58 },
  { name: 'Whitby', cx: 76, cy: 55 },
  { name: 'Oshawa', cx: 79, cy: 52 },
  { name: 'Bowmanville', cx: 84, cy: 48 },
  { name: 'Brantford', cx: 33, cy: 78 },
  { name: 'Cambridge', cx: 37, cy: 73 },
  { name: 'Waterloo', cx: 32, cy: 68 },
  { name: 'Kitchener', cx: 34, cy: 70 },
]

export default function AreaMap() {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', background: '#bfe0e0', overflow: 'hidden' }}>
      <style>{`
        @keyframes pinDrop {
          0% { transform: translateY(-24px); opacity: 0; }
          60% { transform: translateY(3px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pinPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a9d6d6" />
            <stop offset="100%" stopColor="#7fc0c4" />
          </linearGradient>
        </defs>
        {/* Lake Ontario (background already lake colored) */}
        <rect x="0" y="0" width="100" height="100" fill="url(#lakeGrad)" />
        {/* Land area — Southern Ontario approximation */}
        <path
          d="M -5,-5 L 105,-5 L 105,40 C 92,42 86,46 80,50 C 72,55 66,58 58,62 C 50,66 42,70 34,74 C 26,78 18,80 8,82 C 2,83 -5,84 -5,84 Z"
          fill="#F7F1E5"
          stroke="#e3dac3"
          strokeWidth="0.5"
        />
        {/* Subtle inland water hint */}
        <ellipse cx="20" cy="40" rx="10" ry="5" fill="#dfeef0" opacity="0.6" />
      </svg>

      {CITIES.map((city, i) => {
        const isHovered = hovered === city.name
        return (
          <div
            key={city.name}
            onMouseEnter={() => setHovered(city.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'absolute',
              left: `${city.cx}%`,
              top: `${city.cy}%`,
              transform: 'translate(-50%, -100%)',
              animation: `pinDrop 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both`,
              cursor: 'pointer',
              zIndex: isHovered ? 30 : 10,
            }}
          >
            {/* Pulse ring */}
            <span
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '-3px',
                width: '14px',
                height: '14px',
                marginLeft: '-7px',
                borderRadius: '50%',
                background: '#D14D2B',
                animation: `pinPulse 1.8s ease-out ${i * 0.1 + 0.6}s infinite`,
                pointerEvents: 'none',
              }}
            />
            {/* Pin */}
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" style={{ display: 'block', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
              <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 16 10 16s10-9 10-16C20 4.477 15.523 0 10 0z" fill="#D14D2B" />
              <circle cx="10" cy="10" r="4" fill="#F7F1E5" />
            </svg>
            {/* Tooltip */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '100%',
                transform: 'translateX(-50%)',
                marginBottom: '4px',
                background: '#161614',
                color: '#F7F1E5',
                fontSize: '11px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
              }}
            >
              {city.name}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          left: '16px',
          bottom: '16px',
          background: 'rgba(22,22,20,0.82)',
          color: '#F7F1E5',
          padding: '8px 12px',
          borderRadius: '10px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D14D2B', display: 'inline-block' }} />
        Southern Ontario service area
      </div>
    </div>
  )
}
