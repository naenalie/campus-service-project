// src/components/CampusMap.tsx
// Peta Kampus UNKLAB SVG Interaktif dengan visualisasi Liquid Glass dan deteksi keluhan aktif

import React, { useState } from 'react';

interface RequestItem {
  id: string;
  request_number: string;
  title: string;
  location: string;
  status: string;
}

interface CampusMapProps {
  requests: RequestItem[];
  selectedBuilding: string | null;
  onSelectBuilding: (buildingId: string | null) => void;
}

interface Building {
  id: string;
  name: string;
  floors: number;
  // Representasi koordinat SVG
  shape: 'rect' | 'polygon';
  rectProps?: { x: number; y: number; width: number; height: number; rx?: number };
  polyProps?: { points: string };
  // Posisi pin badge merah untuk notifikasi keluhan aktif
  badgePos: { x: number; y: number };
}

export const CampusMap: React.FC<CampusMapProps> = ({ requests, selectedBuilding, onSelectBuilding }) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Daftar Gedung Kampus Utama Universitas Klabat (UNKLAB)
  const buildings: Building[] = [
    {
      id: 'GK1',
      name: 'Gedung Kuliah 1 (GK1)',
      floors: 3,
      shape: 'rect',
      rectProps: { x: 80, y: 80, width: 140, height: 80, rx: 8 },
      badgePos: { x: 210, y: 80 }
    },
    {
      id: 'GK2',
      name: 'Gedung Kuliah 2 (GK2)',
      floors: 3,
      shape: 'rect',
      rectProps: { x: 260, y: 80, width: 140, height: 80, rx: 8 },
      badgePos: { x: 390, y: 80 }
    },
    {
      id: 'GK3',
      name: 'Gedung Kuliah 3 (GK3)',
      floors: 3,
      shape: 'rect',
      rectProps: { x: 440, y: 80, width: 140, height: 80, rx: 8 },
      badgePos: { x: 570, y: 80 }
    },
    {
      id: 'Crystal',
      name: 'Crystal Building (Rektorat)',
      floors: 4,
      shape: 'polygon',
      polyProps: { points: '630,70 750,110 710,210 590,170' },
      badgePos: { x: 730, y: 100 }
    },
    {
      id: 'Chapel',
      name: 'Pioneer Chapel',
      floors: 1,
      shape: 'polygon',
      polyProps: { points: '100,320 220,320 160,230' },
      badgePos: { x: 160, y: 230 }
    },
    {
      id: 'Hall',
      name: 'Fekon Hall & Gymnasium',
      floors: 2,
      shape: 'rect',
      rectProps: { x: 270, y: 230, width: 160, height: 110, rx: 12 },
      badgePos: { x: 420, y: 230 }
    },
    {
      id: 'Asrama',
      name: 'Asrama Pioneer (Dormitory)',
      floors: 3,
      shape: 'rect',
      rectProps: { x: 510, y: 250, width: 180, height: 100, rx: 8 },
      badgePos: { x: 680, y: 250 }
    }
  ];

  // Mendapatkan keluhan aktif per gedung (status SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS)
  const getBuildingRequests = (buildingId: string) => {
    return requests.filter(req => {
      const matchesLocation = req.location.toLowerCase().includes(buildingId.toLowerCase());
      const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(req.status);
      return matchesLocation && isPending;
    });
  };

  const getBuildingColor = (buildingId: string, isHovered: boolean, isSelected: boolean) => {
    const activeCount = getBuildingRequests(buildingId).length;
    
    if (isSelected) {
      return 'rgba(139, 92, 246, 0.45)'; // Purple Glass Highlight
    }
    if (isHovered) {
      return 'rgba(255, 255, 255, 0.2)'; // Hover highlight
    }
    if (activeCount > 0) {
      return 'rgba(245, 158, 11, 0.25)'; // Amber/Warning Glass jika ada kerusakan
    }
    return 'rgba(255, 255, 255, 0.08)'; // Normal subtle glass
  };

  const getBuildingStroke = (buildingId: string, isSelected: boolean) => {
    const activeCount = getBuildingRequests(buildingId).length;
    if (isSelected) return 'var(--accent-purple)';
    if (activeCount > 0) return 'var(--accent-amber)';
    return 'rgba(255, 255, 255, 0.2)';
  };

  // Popup data jika ada gedung terpilih
  const activeSelectedBuilding = buildings.find(b => b.id === selectedBuilding);
  const selectedBuildingRequests = selectedBuilding ? getBuildingRequests(selectedBuilding) : [];

  return (
    <div style={styles.mapWrapper}>
      {/* SVG Container Peta */}
      <svg 
        viewBox="0 0 800 400" 
        style={styles.svgCanvas}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pattern Background Grid */}
        <defs>
          <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="url(#gridPattern)" />

        {/* Gambar Jalan Setapak & Landmark */}
        <path d="M 0,200 L 800,200" stroke="rgba(255,255,255,0.05)" strokeWidth="20" fill="none" />
        <path d="M 240,0 L 240,400" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" />
        <path d="M 490,0 L 490,400" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" />

        {/* Gambar Gedung */}
        {buildings.map(b => {
          const isHovered = hoveredBuilding === b.id;
          const isSelected = selectedBuilding === b.id;
          const activeRequests = getBuildingRequests(b.id);
          const hasActiveRequests = activeRequests.length > 0;
          
          const fill = getBuildingColor(b.id, isHovered, isSelected);
          const stroke = getBuildingStroke(b.id, isSelected);

          const svgElementProps = {
            fill,
            stroke,
            strokeWidth: isSelected || isHovered ? 2 : 1,
            cursor: 'pointer',
            style: {
              transition: 'all 0.3s ease',
              filter: hasActiveRequests 
                ? `drop-shadow(0 0 6px ${isSelected ? 'var(--accent-purple)' : 'var(--accent-amber)'})`
                : 'none'
            },
            onMouseEnter: () => setHoveredBuilding(b.id),
            onMouseLeave: () => setHoveredBuilding(null),
            onClick: () => onSelectBuilding(isSelected ? null : b.id)
          };

          return (
            <g key={b.id}>
              {/* Bentuk Fisik Gedung */}
              {b.shape === 'rect' ? (
                <rect {...b.rectProps} {...svgElementProps} />
              ) : (
                <polygon {...b.polyProps} {...svgElementProps} />
              )}

              {/* Text Label Gedung */}
              <text
                x={b.shape === 'rect' 
                  ? (b.rectProps!.x + b.rectProps!.width / 2) 
                  : 660
                }
                y={b.shape === 'rect' 
                  ? (b.rectProps!.y + b.rectProps!.height / 2 + 5) 
                  : 140
                }
                fill={isSelected || isHovered ? '#fff' : 'var(--text-secondary)'}
                fontSize="11"
                fontWeight={isSelected || isHovered ? '600' : '500'}
                textAnchor="middle"
                pointerEvents="none"
                style={{ transition: 'fill 0.2s' }}
              >
                {b.id}
              </text>

              {/* Red Badge/Pin Notifikasi (Glow + Pulse) */}
              {hasActiveRequests && (
                <g className="pulse-badge-group">
                  <circle
                    cx={b.badgePos.x}
                    cy={b.badgePos.y}
                    r="9"
                    fill="var(--accent-rose)"
                    style={{ animation: 'pulseGlow 1.8s infinite' }}
                  />
                  <text
                    x={b.badgePos.x}
                    y={b.badgePos.y + 3}
                    fill="#fff"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {activeRequests.length}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Pop-up Melayang Detail Kerusakan Gedung (Glass Card) */}
      {activeSelectedBuilding && (
        <div className="glass-card-strong animate-in" style={styles.popupCard}>
          <div style={styles.popupHeader}>
            <div>
              <h4 style={styles.popupTitle}>{activeSelectedBuilding.name}</h4>
              <p style={styles.popupSubtitle}>{activeSelectedBuilding.floors} Lantai</p>
            </div>
            <button 
              onClick={() => onSelectBuilding(null)}
              style={styles.closeBtn}
            >
              ✕
            </button>
          </div>

          <div style={styles.popupBody}>
            <p style={styles.popupSectionTitle}>Keluhan Aktif ({selectedBuildingRequests.length}):</p>
            {selectedBuildingRequests.length === 0 ? (
              <p style={styles.emptyText}>Tidak ada keluhan aktif di gedung ini. Aman! 🎉</p>
            ) : (
              <div style={styles.ticketMiniList}>
                {selectedBuildingRequests.slice(0, 3).map(req => (
                  <div key={req.id} style={styles.ticketMiniItem}>
                    <span style={styles.ticketMiniNumber}>{req.request_number}</span>
                    <span style={styles.ticketMiniTitle}>{req.title}</span>
                  </div>
                ))}
                {selectedBuildingRequests.length > 3 && (
                  <p style={styles.moreText}>+ {selectedBuildingRequests.length - 3} keluhan lagi</p>
                )}
              </div>
            )}
          </div>

          <div style={styles.popupFooter}>
            <button 
              onClick={() => onSelectBuilding(null)}
              className="btn-glass"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS Styles & Animations
const styles: Record<string, React.CSSProperties> = {
  mapWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#110F1A',
    borderRadius: '20px',
    border: '1px solid var(--border-glass)',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
  },
  svgCanvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  popupCard: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: '300px',
    padding: '20px',
    zIndex: 10,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  popupTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  popupSubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '2px',
  },
  popupBody: {
    marginBottom: '16px',
  },
  popupSectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-purple)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  ticketMiniList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  ticketMiniItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '11.5px',
    color: '#f8fafc',
    padding: '4px 6px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
  },
  ticketMiniNumber: {
    fontFamily: 'monospace',
    color: 'var(--accent-amber)',
  },
  ticketMiniTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  moreText: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    textAlign: 'right',
    marginTop: '2px',
  },
  popupFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

// Injection pulse animation untuk badge notifikasi keluhan aktif
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes badgePulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
    .pulse-badge-group circle {
      transform-origin: center;
      animation: badgePulse 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(styleTag);
}
