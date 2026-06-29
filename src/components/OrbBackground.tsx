// src/components/OrbBackground.tsx
// Komponen background floating orbs yang mempercantik tampilan visual halaman (Liquid Glass effect)

import React from 'react';

export const OrbBackground: React.FC = () => {
  return (
    <div className="orb-bg">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
    </div>
  );
};
