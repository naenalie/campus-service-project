// src/components/CampusMap.tsx
// Peta Kampus UNKLAB 2D Landscape Flat & Interaktif (Design Premium, High-fidelity Vector Layout)

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
  description: string;
  flatX: number;
  flatY: number;
  flatW: number;
  flatH: number;
  icon: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({ requests, selectedBuilding, onSelectBuilding }) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Daftar Gedung Utama UNKLAB (Sesuai Struktur Tata Letak Kampus Universitas Klabat)
  const buildings: Building[] = [
    {
      id: 'GK3',
      name: 'Gedung Kuliah 3 (GK3)',
      floors: 3,
      description: 'Gedung perkuliahan Fakultas Ekonomi & Bisnis serta Fakultas Filsafat.',
      flatX: 60,
      flatY: 50,
      flatW: 190,
      flatH: 55,
      icon: '🏫'
    },
    {
      id: 'GK2',
      name: 'Gedung Kuliah 2 (GK2)',
      floors: 3,
      description: 'Gedung perkuliahan umum dengan fasilitas laboratorium komputer terpadu.',
      flatX: 60,
      flatY: 125,
      flatW: 190,
      flatH: 55,
      icon: '💻'
    },
    {
      id: 'GK1',
      name: 'Gedung Kuliah 1 (GK1)',
      floors: 3,
      description: 'Fakultas Pertanian, Keperawatan, pusat layanan mahasiswa, dan administrasi keuangan.',
      flatX: 60,
      flatY: 200,
      flatW: 190,
      flatH: 55,
      icon: '🏥'
    },
    {
      id: 'Hall',
      name: 'Fekon Hall & Gym',
      floors: 2,
      description: 'Auditorium utama universitas untuk acara wisuda, olahraga indoor, dan seminar.',
      flatX: 590,
      flatY: 50,
      flatW: 210,
      flatH: 60,
      icon: '🏀'
    },
    {
      id: 'Chapel',
      name: 'Pioneer Chapel',
      floors: 1,
      description: 'Pusat ibadah ikonik UNKLAB dengan arsitektur atap segitiga runcing menjulang tinggi.',
      flatX: 310,
      flatY: 150,
      flatW: 220,
      flatH: 80,
      icon: '⛪'
    },
    {
      id: 'Fernheim',
      name: 'Fernheim Cafeteria',
      floors: 2,
      description: 'Pusat jajanan mahasiswa, cafetaria kampus, dan Student Center.',
      flatX: 590,
      flatY: 140,
      flatW: 210,
      flatH: 60,
      icon: '☕'
    }
  ];

  // Hitung keluhan aktif per gedung
  const getBuildingRequests = (buildingId: string) => {
    return requests.filter(req => {
      const matchesLocation = req.location.toLowerCase().includes(buildingId.toLowerCase());
      const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(req.status);
      return matchesLocation && isPending;
    });
  };

  const activeSelectedBuilding = buildings.find(b => b.id === selectedBuilding);
  const selectedBuildingRequests = selectedBuilding ? getBuildingRequests(selectedBuilding) : [];

  return (
    <div style={styles.mapWrapper}>
      {/* MAP HEADER */}
      <div style={styles.mapHeader}>
        <div style={styles.headerIndicator}>
          <span style={styles.pulseDot}></span>
          <span style={styles.headerTitle}>Peta Visual Landscape Universitas Klabat (Flat Vector 2D)</span>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}><span style={styles.legendGreen}></span> Normal</span>
          <span style={styles.legendItem}><span style={styles.legendGold}></span> Ada Kerusakan</span>
        </div>
      </div>

      {/* SVG CANVAS LANDSCAPE (Clean 2D Flat Vector Map) */}
      <div style={styles.mapContainer}>
        <svg width="860" height="420" viewBox="0 0 860 420" style={{ overflow: 'visible' }}>
          <defs>
            {/* Gradien Padang Rumput Hijau Premium */}
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E5E2F" />
              <stop offset="50%" stopColor="#2E7D32" />
              <stop offset="100%" stopColor="#388E3C" />
            </linearGradient>
            {/* Gradien Danau Air Biru */}
            <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            {/* Radial Gradient untuk Pohon */}
            <radialGradient id="treeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="70%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </radialGradient>
            {/* Shadow Filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
            </filter>
            {/* Glow Filter untuk Bangunan Rusak */}
            <filter id="glowAlert" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. HAMPARAN RUMPUT UTAMA */}
          <rect x="10" y="10" width="840" height="400" rx="30" fill="url(#grassGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" filter="url(#softShadow)" />

          {/* 2. AREA DANAU ALAMIAH */}
          <path d="M 12 100 Q 80 130 90 200 Q 100 280 40 330 Q 12 350 12 350 Z" fill="url(#lakeGrad)" opacity="0.9" />

          {/* 3. TATA JALANAN KAMPUS (Road Network) */}
          {/* Main Entrance Boulevard (Front/South to Roundabout) */}
          <line x1="420" y1="410" x2="420" y2="280" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
          <line x1="420" y1="410" x2="420" y2="280" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />

          {/* Circular Roundabout */}
          <circle cx="420" cy="270" r="35" fill="#334155" />
          <circle cx="420" cy="270" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="420" cy="270" r="16" fill="#2E7D32" /> {/* Roundabout garden island */}

          {/* Connecting Crossroads */}
          {/* West Road to GK buildings */}
          <line x1="420" y1="270" x2="270" y2="270" stroke="#334155" strokeWidth="16" />
          {/* East Road to Hall/Cafeteria */}
          <line x1="420" y1="270" x2="570" y2="270" stroke="#334155" strokeWidth="16" />

          {/* Vertical road for GK buildings (West Wing) */}
          <line x1="270" y1="40" x2="270" y2="350" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
          <line x1="270" y1="40" x2="270" y2="350" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

          {/* Vertical road for Gym/Fernheim (East Wing) */}
          <line x1="570" y1="40" x2="570" y2="350" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
          <line x1="570" y1="40" x2="570" y2="350" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

          {/* Pedestrian Pathways (Dotted Lines) */}
          <path d="M 270 200 L 310 200" fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.8" />
          <path d="M 530 200 L 570 200" fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.8" />
          <path d="M 420 150 L 420 235" fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.8" />

          {/* 4. PARKIRAN KAMPUS (Parking Lots) */}
          <g opacity="0.45" fill="#475569" stroke="#E2E8F0" strokeWidth="1">
            {/* GK Parking */}
            <rect x="210" y="275" width="45" height="30" rx="3" />
            <text x="232" y="295" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">P</text>
            {/* Hall Parking */}
            <rect x="585" y="275" width="45" height="30" rx="3" />
            <text x="607" y="295" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">P</text>
          </g>

          {/* 5. TREE ROW GARDENS (Beautiful radial trees) */}
          <g>
            {/* Boulevard Trees */}
            <circle cx="395" cy="380" r="8" fill="url(#treeGrad)" />
            <circle cx="395" cy="340" r="8" fill="url(#treeGrad)" />
            <circle cx="395" cy="300" r="8" fill="url(#treeGrad)" />
            <circle cx="445" cy="380" r="8" fill="url(#treeGrad)" />
            <circle cx="445" cy="340" r="8" fill="url(#treeGrad)" />
            <circle cx="445" cy="300" r="8" fill="url(#treeGrad)" />

            {/* Central Roundabout Flowers/Garden */}
            <circle cx="420" cy="270" r="6" fill="#F59E0B" />
            
            {/* Lakeside forest */}
            <circle cx="85" cy="140" r="12" fill="url(#treeGrad)" />
            <circle cx="100" cy="155" r="14" fill="url(#treeGrad)" />
            <circle cx="105" cy="225" r="11" fill="url(#treeGrad)" />
            <circle cx="110" cy="245" r="13" fill="url(#treeGrad)" />
          </g>

          {/* 6. INTERACTIVE BUILDINGS LAYER */}
          {buildings.map(b => {
            const activeRequests = getBuildingRequests(b.id);
            const hasProblem = activeRequests.length > 0;
            const isHovered = hoveredBuilding === b.id;
            const isSelected = selectedBuilding === b.id;

            // Premium Styling based on status
            let cardBg = 'rgba(255, 255, 255, 0.95)';
            let strokeColor = 'rgba(0,0,0,0.1)';
            let strokeW = 1.5;
            let textColor = '#0F172A';
            let alertPulse = false;

            if (isSelected) {
              cardBg = '#D4E875';
              strokeColor = '#101411';
              strokeW = 3;
              textColor = '#101411';
            } else if (isHovered) {
              cardBg = '#F3FEE3';
              strokeColor = '#1B4332';
              strokeW = 2.5;
              textColor = '#1B4332';
            } else if (hasProblem) {
              cardBg = '#FEF3C7'; // Warm Warning Amber
              strokeColor = '#F59E0B'; // Warning Solid Orange
              strokeW = 2.5;
              textColor = '#92400E';
              alertPulse = true;
            }

            const x = b.flatX;
            const y = b.flatY;
            const w = b.flatW;
            const h = b.flatH;

            return (
              <g
                key={b.id}
                onMouseEnter={() => setHoveredBuilding(b.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => onSelectBuilding(isSelected ? null : b.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glowing shadow effect for problem buildings */}
                {alertPulse && (
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width={w + 8}
                    height={h + 8}
                    rx="16"
                    ry="16"
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.5)"
                    strokeWidth="4"
                    filter="url(#glowAlert)"
                  />
                )}

                {/* Building Base Shape */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="14"
                  ry="14"
                  fill={cardBg}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  filter="url(#softShadow)"
                  style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />

                {/* Left Accent Bar for visual detail */}
                <rect
                  x={x + 1}
                  y={y + 12}
                  width="4"
                  height={h - 24}
                  rx="2"
                  fill={hasProblem ? '#F59E0B' : (isSelected || isHovered ? '#1B4332' : '#64748B')}
                />

                {/* Icon & Building Title Group */}
                <g transform={`translate(${x + 16}, ${y + h/2 - 1})`}>
                  <text
                    x="0"
                    y="5"
                    fontSize="18"
                    fontFamily="Outfit, sans-serif"
                    pointerEvents="none"
                  >
                    {b.icon}
                  </text>
                  <text
                    x="28"
                    y="4"
                    fill={textColor}
                    fontSize="12.5"
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    pointerEvents="none"
                  >
                    {b.name}
                  </text>
                </g>

                {/* Warning Counter Indicator Badge */}
                {hasProblem && (
                  <g transform={`translate(${x + w - 12}, ${y + 12})`}>
                    <circle cx="0" cy="0" r="10.5" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                      {activeRequests.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* POP-UP DETAIL MELAYANG GLASSMORPHISM */}
      {activeSelectedBuilding && (
        <div 
          className="card-slide4 animate-in" 
          style={styles.popupCard}
        >
          <div className="card-slide4-tab">
            <span>⚙️</span> INFO DETAIL GEDUNG
          </div>

          <div style={styles.popupHeader}>
            <div>
              <h4 style={styles.popupTitle}>{activeSelectedBuilding.name}</h4>
              <p style={styles.popupSubtitle}>{activeSelectedBuilding.floors} Lantai • Kode: {activeSelectedBuilding.id}</p>
            </div>
            <button 
              onClick={() => onSelectBuilding(null)}
              style={styles.closeBtn}
            >
              ✕
            </button>
          </div>

          <div style={styles.popupBody}>
            <p style={{ fontSize: '13px', color: '#56665A', lineHeight: '1.6', marginBottom: '16px' }}>
              {activeSelectedBuilding.description}
            </p>
            
            <p style={styles.popupSectionTitle}>Laporan Kerusakan Aktif ({selectedBuildingRequests.length}):</p>
            {selectedBuildingRequests.length === 0 ? (
              <p style={styles.emptyText}>Tidak ada keluhan aktif di gedung ini. Aman! 🎉</p>
            ) : (
              <div style={styles.ticketMiniList}>
                {selectedBuildingRequests.map(req => (
                  <div key={req.id} style={styles.ticketMiniItem}>
                    <span style={styles.ticketMiniNumber}>{req.request_number}</span>
                    <span style={styles.ticketMiniTitle}>{req.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.popupFooter}>
            <button 
              onClick={() => onSelectBuilding(null)}
              className="btn-glass"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles premium
const styles: Record<string, React.CSSProperties> = {
  mapWrapper: {
    position: 'relative',
    width: '100%',
    minHeight: '480px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)', /* Frosted glass base */
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  },
  mapHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    zIndex: 5,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  headerIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    boxShadow: '0 0 8px #2E7D32',
    animation: 'pulseGlow 2s infinite',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    color: '#101411',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#101411',
    fontWeight: '600',
  },
  legendGreen: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    backgroundColor: '#2E7D32',
  },
  legendGold: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    backgroundColor: '#F59E0B',
  },
  mapContainer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflowX: 'auto',
  },
  popupCard: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    width: '320px',
    zIndex: 20,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  popupTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '17px',
    fontWeight: '700',
    color: '#101411',
    margin: 0,
  },
  popupSubtitle: {
    fontSize: '11px',
    color: '#56665A',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#56665A',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px',
  },
  popupBody: {
    marginBottom: '16px',
  },
  popupSectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  emptyText: {
    fontSize: '13px',
    color: '#56665A',
  },
  ticketMiniList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '130px',
    overflowY: 'auto',
  },
  ticketMiniItem: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    color: '#101411',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '8px',
  },
  ticketMiniNumber: {
    fontFamily: 'monospace',
    color: '#004B87',
    fontWeight: '700',
  },
  ticketMiniTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  popupFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  }
};
