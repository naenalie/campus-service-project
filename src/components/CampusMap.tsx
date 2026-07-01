// src/components/CampusMap.tsx
// Peta Kampus UNKLAB 2D Landscape Flat & Interaktif (Menampilkan sarana perkuliahan utama)

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
}

export const CampusMap: React.FC<CampusMapProps> = ({ requests, selectedBuilding, onSelectBuilding }) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Daftar Gedung Utama UNKLAB (Tanpa Rektorat Crystal dan Dormitory/Asrama)
  const buildings: Building[] = [
    {
      id: 'GK3',
      name: 'Gedung Kuliah 3 (GK3)',
      floors: 3,
      description: 'Gedung perkuliahan Fakultas Ekonomi & Bisnis serta Fakultas Filsafat.',
      flatX: 50,
      flatY: 50,
      flatW: 190,
      flatH: 55,
    },
    {
      id: 'GK2',
      name: 'Gedung Kuliah 2 (GK2)',
      floors: 3,
      description: 'Gedung perkuliahan umum dengan fasilitas laboratorium komputer terpadu.',
      flatX: 50,
      flatY: 130,
      flatW: 190,
      flatH: 55,
    },
    {
      id: 'GK1',
      name: 'Gedung Kuliah 1 (GK1)',
      floors: 3,
      description: 'Fakultas Pertanian, Keperawatan, pusat layanan mahasiswa, dan administrasi keuangan.',
      flatX: 50,
      flatY: 210,
      flatW: 190,
      flatH: 55,
    },
    {
      id: 'Hall',
      name: 'Fekon Hall & Gymnasium',
      floors: 2,
      description: 'Auditorium utama universitas untuk acara wisuda, olahraga indoor, dan seminar.',
      flatX: 320,
      flatY: 50,
      flatW: 220,
      flatH: 60,
    },
    {
      id: 'Chapel',
      name: 'Pioneer Chapel',
      floors: 1,
      description: 'Pusat ibadah ikonik UNKLAB dengan arsitektur atap segitiga runcing menjulang tinggi.',
      flatX: 320,
      flatY: 150,
      flatW: 220,
      flatH: 70,
    },
    {
      id: 'Fernheim',
      name: 'Fernheim Cafeteria',
      floors: 2,
      description: 'Pusat jajanan mahasiswa, cafetaria kampus, dan Student Center.',
      flatX: 580,
      flatY: 100,
      flatW: 220,
      flatH: 60,
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
          <span style={styles.headerTitle}>Peta Visual Landscape Universitas Klabat (2D Flat)</span>
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
            {/* Gradien Padang Rumput Hijau Segar */}
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#388E3C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.8" />
            </linearGradient>
            {/* Gradien Danau Air Biru Tenang */}
            <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A3E0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
            </linearGradient>
            {/* Shadow Filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 1. HAMPARAN RUMPUT UTAMA */}
          <rect x="10" y="10" width="840" height="400" rx="30" fill="url(#grassGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#softShadow)" />

          {/* 2. AREA DANAU DI SEBELAH KIRI */}
          <path d="M 12 100 Q 80 130 90 200 Q 100 280 40 330 Q 12 350 12 350 Z" fill="url(#lakeGrad)" opacity="0.85" />

          {/* JALAN FLAT 2D */}
          <line x1="270" y1="10" x2="270" y2="410" stroke="#475569" strokeWidth="16" opacity="0.6" />
          <line x1="270" y1="10" x2="270" y2="410" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />

          {/* Roundabout in the middle */}
          <circle cx="440" cy="270" r="35" fill="#475569" opacity="0.6" />
          <circle cx="440" cy="270" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="440" cy="270" r="15" fill="#388E3C" />

          {/* Connecting road paths */}
          <line x1="270" y1="270" x2="405" y2="270" stroke="#475569" strokeWidth="12" opacity="0.6" />
          <line x1="475" y1="270" x2="570" y2="270" stroke="#475569" strokeWidth="12" opacity="0.6" />

          {/* Flat Trees */}
          <g fill="#1E3A1E" opacity="0.75">
            <circle cx="120" cy="60" r="10" />
            <circle cx="135" cy="50" r="8" />
            <circle cx="110" cy="75" r="9" />
            <circle cx="125" cy="180" r="11" />
            <circle cx="130" cy="280" r="10" />
            <circle cx="500" cy="60" r="10" />
            <circle cx="520" cy="50" r="8" />
          </g>

          {/* Gedung Flat 2D */}
          {buildings.map(b => {
            const activeRequests = getBuildingRequests(b.id);
            const hasProblem = activeRequests.length > 0;
            const isHovered = hoveredBuilding === b.id;
            const isSelected = selectedBuilding === b.id;

            // Styling status
            let cardBg = 'rgba(255, 255, 255, 0.95)';
            let strokeColor = 'rgba(255,255,255,0.8)';
            let strokeW = 1.5;
            let textColor = '#101411';

            if (isSelected) {
              cardBg = '#D4E875';
              strokeColor = '#101411';
              strokeW = 3;
              textColor = '#101411';
            } else if (isHovered) {
              cardBg = '#E6F4A8';
              strokeColor = '#101411';
              strokeW = 2;
              textColor = '#101411';
            } else if (hasProblem) {
              cardBg = '#FEF3C7';
              strokeColor = '#D97706';
              strokeW = 2;
              textColor = '#92400E';
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
                {/* Building Base Rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="12"
                  ry="12"
                  fill={cardBg}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  filter="url(#softShadow)"
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Building Name Text */}
                <text
                  x={x + w/2}
                  y={y + h/2 + 4}
                  fill={textColor}
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="Outfit, sans-serif"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {b.name}
                </text>

                {/* Pin Warning Badge */}
                {hasProblem && (
                  <g transform={`translate(${x + w - 10}, ${y + 10})`}>
                    <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
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
            <span>⚙️</span> INFO DETAIL
          </div>

          <div style={styles.popupHeader}>
            <div>
              <h4 style={styles.popupTitle}>{activeSelectedBuilding.name}</h4>
              <p style={styles.popupSubtitle}>{activeSelectedBuilding.floors} Lantai • {activeSelectedBuilding.id}</p>
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
            
            <p style={styles.popupSectionTitle}>Laporan Kerusakan ({selectedBuildingRequests.length}):</p>
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
