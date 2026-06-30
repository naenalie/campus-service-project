// src/components/CampusMap.tsx
// Peta Kampus UNKLAB 3D Landscape Hijau Asri & Interaktif (Inspirasi Slide 2, 3 & 4)
// Menampilkan padang rumput hijau, pepohonan 3D, danau biru, jalan kampus, dan gedung-gedung 3D UNKLAB

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
  // Isometric base coordinate (X, Y) dan size (W, H) di atas padang rumput
  isoX: number;
  isoY: number;
  isoW: number;
  isoH: number;
  isoZ: number; // Tinggi gedung (z-axis)
  pinOffset: { x: number; y: number };
}

export const CampusMap: React.FC<CampusMapProps> = ({ requests, selectedBuilding, onSelectBuilding }) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Daftar Gedung Utama UNKLAB sesuai Tata Letak Asli
  const buildings: Building[] = [
    {
      id: 'Chapel',
      name: 'Pioneer Chapel',
      floors: 1,
      description: 'Pusat ibadah ikonik UNKLAB dengan arsitektur atap segitiga runcing menjulang tinggi.',
      isoX: 390,
      isoY: 230,
      isoW: 70,
      isoH: 70,
      isoZ: 85, // Atap sangat tinggi menjulang
      pinOffset: { x: 35, y: -30 }
    },
    {
      id: 'GK1',
      name: 'Gedung Kuliah 1 (GK1)',
      floors: 3,
      description: 'Fakultas Pertanian, Keperawatan, pusat layanan mahasiswa, dan administrasi keuangan.',
      isoX: 180,
      isoY: 260,
      isoW: 80,
      isoH: 50,
      isoZ: 45,
      pinOffset: { x: 40, y: -20 }
    },
    {
      id: 'GK2',
      name: 'Gedung Kuliah 2 (GK2)',
      floors: 3,
      description: 'Gedung perkuliahan umum dengan fasilitas laboratorium komputer terpadu.',
      isoX: 180,
      isoY: 180,
      isoW: 80,
      isoH: 50,
      isoZ: 45,
      pinOffset: { x: 40, y: -20 }
    },
    {
      id: 'GK3',
      name: 'Gedung Kuliah 3 (GK3)',
      floors: 3,
      description: 'Gedung perkuliahan Fakultas Ekonomi & Bisnis serta Fakultas Filsafat.',
      isoX: 180,
      isoY: 100,
      isoW: 80,
      isoH: 50,
      isoZ: 45,
      pinOffset: { x: 40, y: -20 }
    },
    {
      id: 'Crystal',
      name: 'Crystal Building (Rektorat)',
      floors: 4,
      description: 'Gedung rektorat utama 4 lantai dengan arsitektur modern pusat administrasi UNKLAB.',
      isoX: 580,
      isoY: 210,
      isoW: 90,
      isoH: 75,
      isoZ: 70,
      pinOffset: { x: 45, y: -25 }
    },
    {
      id: 'Fernheim',
      name: 'Fernheim Cafeteria & Student Center',
      floors: 2,
      description: 'Pusat jajanan mahasiswa, cafetaria kampus, dan Student Center.',
      isoX: 580,
      isoY: 130,
      isoW: 75,
      isoH: 60,
      isoZ: 35,
      pinOffset: { x: 37, y: -15 }
    },
    {
      id: 'Hall',
      name: 'Fekon Hall & Gymnasium',
      floors: 2,
      description: 'Auditorium utama universitas untuk acara wisuda, olahraga indoor, dan seminar.',
      isoX: 370,
      isoY: 90,
      isoW: 100,
      isoH: 70,
      isoZ: 40,
      pinOffset: { x: 50, y: -15 }
    },
    {
      id: 'Dorm',
      name: 'Asrama Pioneer & Crystal (Dormitory)',
      floors: 3,
      description: 'Kompleks asrama mahasiswa putra dan putri di bagian belakang kampus.',
      isoX: 560,
      isoY: 50,
      isoW: 120,
      isoH: 60,
      isoZ: 45,
      pinOffset: { x: 60, y: -20 }
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
          <span style={styles.headerTitle}>Peta Visual 3D Landscape Universitas Klabat</span>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}><span style={styles.legendGreen}></span> Normal</span>
          <span style={styles.legendItem}><span style={styles.legendGold}></span> Ada Kerusakan</span>
        </div>
      </div>

      {/* SVG CANVAS LANDSCAPE (Slide 2 & 3 style) */}
      <div style={styles.mapContainer}>
        <svg width="860" height="420" viewBox="0 0 860 420" style={{ overflow: 'visible' }}>
          {/* DEFINITIONS FOR GRADIENTS & SHADOWS */}
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
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
            </filter>
            {/* Shading untuk Dinding Gedung */}
            <linearGradient id="wallLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="wallDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* 1. HAMPARAN RUMPUT UTAMA (Base Green Field - Slide 2 & 3) */}
          <rect x="10" y="10" width="840" height="400" rx="30" fill="url(#grassGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" filter="url(#softShadow)" />

          {/* 2. AREA DANAU / AIR DI SEBELAH KIRI (West Lake - Slide 3) */}
          <path d="M 12 100 Q 80 130 90 200 Q 100 280 40 330 Q 12 350 12 350 Z" fill="url(#lakeGrad)" opacity="0.85" />
          <path d="M 12 110 Q 75 135 82 200 Q 90 270 38 320 Q 12 340 12 340 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* 3. JALAN KAMPUS UTAMA (Roadway & Paths) */}
          {/* Main Gate Road from South */}
          <path d="M 430 410 C 430 350, 420 300, 420 280" fill="none" stroke="#64748B" strokeWidth="22" strokeLinecap="round" opacity="0.8" />
          <path d="M 430 410 C 430 350, 420 300, 420 280" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
          {/* Loop melingkar depan Chapel */}
          <circle cx="420" cy="270" r="30" fill="none" stroke="#64748B" strokeWidth="14" opacity="0.8" />
          
          {/* Jalan ke area barat (GK1-3) */}
          <path d="M 390 270 Q 280 260 250 250" fill="none" stroke="#64748B" strokeWidth="10" opacity="0.6" />
          <path d="M 250 270 L 250 110" fill="none" stroke="#64748B" strokeWidth="8" opacity="0.6" />

          {/* Jalan ke area timur (Crystal Rektorat) */}
          <path d="M 450 270 Q 520 255 580 250" fill="none" stroke="#64748B" strokeWidth="10" opacity="0.6" />
          <path d="M 580 250 L 580 140" fill="none" stroke="#64748B" strokeWidth="8" opacity="0.6" />

          {/* 4. DEKORASI POHON 3D (3D Trees - Slide 2 & 3 style) */}
          {/* Hutan kecil samping danau */}
          <g fill="#1B4332" stroke="#2D6A4F" strokeWidth="1">
            <circle cx="95" cy="140" r="10" />
            <circle cx="90" cy="150" r="12" />
            <circle cx="105" cy="145" r="9" />
            
            <circle cx="110" cy="230" r="11" />
            <circle cx="115" cy="245" r="13" />

            {/* Pohon di taman tengah */}
            <circle cx="340" cy="240" r="9" fill="#2D6A4F" />
            <circle cx="480" cy="250" r="10" fill="#2D6A4F" />
            <circle cx="500" cy="235" r="8" fill="#2D6A4F" />
          </g>

          {/* 5. GAMBAR GEDUNG 3D (3D Buildings Drawing) */}
          {buildings.map(b => {
            const activeRequests = getBuildingRequests(b.id);
            const hasProblem = activeRequests.length > 0;
            const isHovered = hoveredBuilding === b.id;
            const isSelected = selectedBuilding === b.id;

            // Dinding Depan & Samping Kanan
            let fillLeft = 'url(#wallLight)';
            let fillRight = 'url(#wallDark)';
            let fillRoof = isSelected ? '#F59E0B' : (isHovered ? '#00A3E0' : '#1E293B'); // Atap Navy Gelap/Gold
            let strokeColor = isSelected ? '#F59E0B' : (isHovered ? '#00A3E0' : 'rgba(255,255,255,0.2)');
            let strokeW = isSelected || isHovered ? 2.5 : 1;

            if (hasProblem && !isSelected && !isHovered) {
              fillLeft = 'rgba(254, 243, 199, 0.9)'; // Soft warm warning color
              fillRight = 'rgba(251, 191, 36, 0.8)';
              strokeColor = 'rgba(245, 158, 11, 0.5)';
            }

            const x = b.isoX;
            const y = b.isoY;
            const w = b.isoW;
            const h = b.isoH;
            const z = b.isoZ;

            return (
              <g 
                key={b.id}
                onMouseEnter={() => setHoveredBuilding(b.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => onSelectBuilding(isSelected ? null : b.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* 3D Shadows Gedung */}
                <polygon
                  points={`${x + 10},${y + h/2 + 10} ${x + w + 10},${y + h + 10} ${x + w + h + 10},${y + h/2 + 10} ${x + h + 10},${y + 10}`}
                  fill="rgba(0,0,0,0.25)"
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Dinding Kiri */}
                <polygon
                  points={`${x},${y} ${x},${y - z} ${x + w},${y + h/2 - z} ${x + w},${y + h/2}`}
                  fill={fillLeft}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Dinding Kanan */}
                <polygon
                  points={`${x + w},${y + h/2} ${x + w},${y + h/2 - z} ${x + w + h},${y - z} ${x + w + h},${y}`}
                  fill={fillRight}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Atap (Special Shape untuk Pioneer Chapel - Segitiga Runcing) */}
                {b.id === 'Chapel' ? (
                  <polygon
                    points={`${x},${y - z} ${x + w/2 + h/2},${y - z - 40} ${x + w + h},${y - z} ${x + w/2},${y + h/2 - z}`}
                    fill={fillRoof}
                    stroke={strokeColor}
                    strokeWidth={strokeW + 0.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                ) : (
                  <polygon
                    points={`${x},${y - z} ${x + w},${y + h/2 - z} ${x + w + h},${y - z} ${x + h},${y - h/2 - z}`}
                    fill={fillRoof}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}

                {/* Label teks nama gedung minimalis */}
                <text
                  x={x + w/2 + 10}
                  y={y - z - 8}
                  fill={isSelected || isHovered ? '#fff' : 'rgba(255,255,255,0.85)'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="Outfit, sans-serif"
                  textAnchor="middle"
                  pointerEvents="none"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                >
                  {b.name}
                </text>

                {/* Pin Warning Melayang Glowing (Slide 2 & 4 style) */}
                {hasProblem && (
                  <g 
                    className="pin-3d" 
                    transform={`translate(${x + b.pinOffset.x}, ${y + b.pinOffset.y})`}
                  >
                    {/* Glowing outer aura */}
                    <circle cx="0" cy="-25" r="14" fill="rgba(245, 158, 11, 0.3)" />
                    {/* Outer Border Pin */}
                    <circle cx="0" cy="-25" r="9" fill="#F59E0B" stroke="#fff" strokeWidth="1.5" />
                    {/* Inner Text */}
                    <text x="0" y="-22" fill="#fff" fontSize="9" fontWeight="800" textAnchor="middle">
                      {activeRequests.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* POP-UP DETAIL MELAYANG GLASSMORPHISM (Slide 4 style) */}
      {activeSelectedBuilding && (
        <div 
          className="card-slide4 animate-in" 
          style={styles.popupCard}
        >
          {/* Slide 4 tag header "FEATURE 01 / INFO" */}
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
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
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
    backgroundColor: '#F1F5F9', /* Default light base */
    borderRadius: '24px',
    border: '1px solid rgba(0,0,0,0.06)',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  },
  mapHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    zIndex: 5,
    position: 'relative',
    backgroundColor: '#fff',
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
    fontWeight: '600',
    color: '#0F172A',
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
    color: '#475569',
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
    color: 'var(--text-primary)',
    margin: 0,
  },
  popupSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
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
    color: 'var(--text-secondary)',
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
    color: 'var(--text-primary)',
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
