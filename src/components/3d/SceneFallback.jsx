import React from 'react'

// Shown in place of a 3D scene when the visitor's browser can't run WebGL.
export default function SceneFallback({ icon, className = '' }) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-cream-dark to-cream ${className}`}>
      {icon && <span className="text-4xl opacity-50" aria-hidden="true">{icon}</span>}
    </div>
  )
}
