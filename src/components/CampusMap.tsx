// src/components/CampusMap.tsx
// Peta Kampus UNKLAB 2D Landscape Flat & Interaktif (Design Premium, High-fidelity Vector Layout)
// Dilengkapi dengan Penanda Jumlah Laporan Aktif, Efek Hover, Kompas, Legenda, dan Popup Info Detail

import React from 'react';

export interface RequestItem {
  id: string;
  request_number: string;
  title: string;
  location: string;
  status: string;
}

export interface CampusMapProps {
  requests: RequestItem[];
  selectedBuilding: string | null;
  onSelectBuilding: (buildingId: string | null) => void;
}

interface BuildingData {
  id: string;
  name: string;
  subLabel: string;
  color: string;
  markerX: number;
  markerY: number;
  labelX: number;
  labelY: number;
}

const getBuildingIdFromLocation = (location: string): string | null => {
  const loc = location.toLowerCase();
  if (loc.includes('gk1')) return 'GK1';
  if (loc.includes('gk2')) return 'GK2';
  if (loc.includes('gk3')) return 'GK3';
  if (loc.includes('ga') || loc.includes('administrasi')) return 'GA';
  if (loc.includes('fwc') || loc.includes('fern')) return 'FWC';
  if (loc.includes('chapel') || loc.includes('pioneer') || loc.includes('pc')) return 'PC';
  if (loc.includes('sport') || loc.includes('hall') || loc.includes('sh')) return 'SH';
  if (loc.includes('tenis') || loc.includes('tennis') || loc.includes('lt')) return 'LT';
  if (loc.includes('kantin') || loc.includes('kt')) return 'KT';
  if (loc.includes('study')) return 'Study Garden';
  if (loc.includes('prayer')) return 'Prayer Garden';
  return null;
};

const buildingsData: Record<string, BuildingData> = {
  GK1: {
    id: 'GK1',
    name: 'GK1 — Gedung Kuliah 1',
    subLabel: '5 Lantai',
    color: '#1e40af',
    markerX: 235,
    markerY: 175,
    labelX: 177,
    labelY: 208
  },
  GK2: {
    id: 'GK2',
    name: 'GK2 — Gedung Kuliah 2',
    subLabel: '1 Lantai (Bentuk U)',
    color: '#2563eb',
    markerX: 475,
    markerY: 385,
    labelX: 405,
    labelY: 415
  },
  GK3: {
    id: 'GK3',
    name: 'GK3 — Gedung Kuliah 3',
    subLabel: '3 Lantai',
    color: '#7c3aed',
    markerX: 175,
    markerY: 260,
    labelX: 132,
    labelY: 292
  },
  GA: {
    id: 'GA',
    name: 'GA — Gedung Administrasi',
    subLabel: '3 Lantai',
    color: '#0891b2',
    markerX: 400,
    markerY: 200,
    labelX: 352,
    labelY: 237
  },
  FWC: {
    id: 'FWC',
    name: 'FWC — Fern Wallace Center',
    subLabel: 'Pusat Kegiatan',
    color: '#0d9488',
    markerX: 540,
    markerY: 105,
    labelX: 497,
    labelY: 132
  },
  PC: {
    id: 'PC',
    name: 'Pioneer Chapel',
    subLabel: 'Gedung Ibadah',
    color: '#b45309',
    markerX: 240,
    markerY: 370,
    labelX: 187,
    labelY: 392
  },
  SH: {
    id: 'SH',
    name: 'Sport Hall',
    subLabel: 'Gymnasium & Lapangan Indoor',
    color: '#15803d',
    markerX: 695,
    markerY: 175,
    labelX: 632,
    labelY: 217
  },
  LT: {
    id: 'LT',
    name: 'Lapangan Tenis',
    subLabel: 'Area Olahraga Outdoor',
    color: '#065f46',
    markerX: 770,
    markerY: 55,
    labelX: 727,
    labelY: 85
  },
  KT: {
    id: 'KT',
    name: 'Kantin Kampus',
    subLabel: 'Pusat Kuliner',
    color: '#c2410c',
    markerX: 635,
    markerY: 305,
    labelX: 605,
    labelY: 325
  },
  'Study Garden': {
    id: 'Study Garden',
    name: 'Study Garden',
    subLabel: 'Taman Belajar Terbuka',
    color: '#16a34a',
    markerX: 350,
    markerY: 90,
    labelX: 320,
    labelY: 110
  },
  'Prayer Garden': {
    id: 'Prayer Garden',
    name: 'Prayer Garden',
    subLabel: 'Taman Doa Teduh',
    color: '#16a34a',
    markerX: 150,
    markerY: 480,
    labelX: 110,
    labelY: 500
  }
};

const treeBlobs = [
  { cx: 70, cy: 90, r: 12 },
  { cx: 150, cy: 70, r: 15 },
  { cx: 240, cy: 60, r: 18 },
  { cx: 280, cy: 110, r: 14 },
  { cx: 620, cy: 110, r: 16 },
  { cx: 720, cy: 220, r: 12 },
  { cx: 750, cy: 260, r: 15 },
  { cx: 710, cy: 320, r: 18 },
  { cx: 730, cy: 450, r: 14 },
  { cx: 680, cy: 490, r: 16 },
  { cx: 580, cy: 520, r: 12 },
  { cx: 260, cy: 520, r: 15 },
  { cx: 180, cy: 540, r: 18 },
  { cx: 80, cy: 560, r: 14 },
  { cx: 40, cy: 490, r: 16 }
];

export const CampusMap: React.FC<CampusMapProps> = ({ 
  requests = [], 
  selectedBuilding, 
  onSelectBuilding 
}) => {
  // Filter laporan aktif (bukan CLOSED)
  const activeRequests = requests.filter(r => r.status.toUpperCase() !== 'CLOSED');

  // Kelompokkan laporan aktif berdasarkan ID Gedung
  const buildingRequests: Record<string, RequestItem[]> = {};
  activeRequests.forEach(req => {
    const bId = getBuildingIdFromLocation(req.location);
    if (bId) {
      if (!buildingRequests[bId]) {
        buildingRequests[bId] = [];
      }
      buildingRequests[bId].push(req);
    }
  });

  const getMarkerColor = (count: number) => {
    if (count === 0) return 'transparent';
    if (count <= 2) return '#f59e0b'; // Kuning
    return '#ef4444'; // Merah
  };

  const getPopupPositionStyle = (bId: string): React.CSSProperties => {
    const bData = buildingsData[bId];
    if (!bData) return {};

    const isRight = bData.labelX > 400;
    const isBottom = bData.labelY > 300;

    const pctX = (bData.labelX / 800) * 100;
    const pctY = (bData.labelY / 600) * 100;

    const style: React.CSSProperties = {
      position: 'absolute',
      width: '260px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      padding: '16px',
      color: 'white',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
      zIndex: 100,
    };

    if (isRight) {
      style.right = `calc(${100 - pctX}% + 24px)`;
    } else {
      style.left = `calc(${pctX}% + 24px)`;
    }

    if (isBottom) {
      style.bottom = `calc(${100 - pctY}% - 40px)`;
    } else {
      style.top = `calc(${pctY}% - 40px)`;
    }

    return style;
  };

  const handleMapBackgroundClick = () => {
    onSelectBuilding(null);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#4ade80'
    }}>
      {/* CSS Animasi Lokal */}
      <style>{`
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.75; }
        }
        @keyframes popupFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .campus-building {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .campus-building:hover {
          filter: brightness(1.2);
          stroke: #ffffff !important;
          stroke-width: 2px !important;
        }
        .campus-building-selected {
          stroke: #ffffff !important;
          stroke-width: 3px !important;
          filter: brightness(1.25) drop-shadow(0 0 12px rgba(255,255,255,0.7)) !important;
        }
        .marker-pulse-element {
          transform-origin: center;
          animation: markerPulse 2s infinite ease-in-out;
        }
        .popup-window-animation {
          animation: popupFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Pill Judul Atas Kiri */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '50px',
        padding: '8px 16px',
        color: '#f8fafc',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
        PETA KAMPUS UNKLAB
      </div>

      {/* PETA VECTOR SVG */}
      <svg
        viewBox="0 0 800 600"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        {/* Background Halaman Hijau Muda */}
        <rect
          width="800"
          height="600"
          fill="#4ade80"
          onClick={handleMapBackgroundClick}
          style={{ cursor: 'default' }}
        />

        {/* Vegetasi / Pepohonan Hijau Tua */}
        <g opacity="0.45" style={{ pointerEvents: 'none' }}>
          {treeBlobs.map((tree, idx) => (
            <circle
              key={idx}
              cx={tree.cx}
              cy={tree.cy}
              r={tree.r}
              fill="#14532d"
            />
          ))}
        </g>

        {/* Jalanan Utama Kampus */}
        <g strokeLinecap="round" opacity="0.85" style={{ pointerEvents: 'none' }}>
          {/* Jalan diagonal utama */}
          <path d="M 50,50 L 750,550" stroke="#c8d5d5" strokeWidth="18" fill="none" />
          {/* Jalan horizontal tengah */}
          <line x1="0" y1="300" x2="800" y2="300" stroke="#c8d5d5" strokeWidth="14" />
          {/* Jalan vertikal */}
          <line x1="420" y1="0" x2="420" y2="600" stroke="#c8d5d5" strokeWidth="12" />
        </g>

        {/* STUDY GARDEN (Ellipse Transparan) */}
        <g style={{ cursor: 'default' }}>
          <ellipse
            cx="320"
            cy="110"
            rx="45"
            ry="30"
            fill="#16a34a"
            fillOpacity="0.4"
            stroke="#15803d"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <text
            x="320"
            y="114"
            fill="#ffffff"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          >
            Study Garden
          </text>
        </g>

        {/* PRAYER GARDEN (Ellipse Transparan) */}
        <g style={{ cursor: 'default' }}>
          <ellipse
            cx="110"
            cy="500"
            rx="55"
            ry="38"
            fill="#16a34a"
            fillOpacity="0.4"
            stroke="#15803d"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <text
            x="110"
            y="504"
            fill="#ffffff"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          >
            Prayer Garden
          </text>
        </g>

        {/* LAPANGAN TENIS (LT) */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('LT'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="670"
            y="45"
            width="115"
            height="80"
            rx="6"
            fill="rgba(6, 95, 70, 0.25)"
            stroke={selectedBuilding === 'LT' ? '#ffffff' : '#065f46'}
            strokeWidth={selectedBuilding === 'LT' ? 3 : 2}
            className={`campus-building ${selectedBuilding === 'LT' ? 'campus-building-selected' : ''}`}
          />
          {/* Garis Net Lapangan */}
          <g stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" fill="none" style={{ pointerEvents: 'none' }}>
            <rect x="675" y="50" width="105" height="70" />
            <line x1="675" y1="85" x2="780" y2="85" />
            <line x1="727.5" y1="50" x2="727.5" y2="120" />
            <line x1="700" y1="50" x2="700" y2="120" strokeOpacity="0.3" />
            <line x1="755" y1="50" x2="755" y2="120" strokeOpacity="0.3" />
          </g>
          <text
            x="727"
            y="90"
            fill="#ffffff"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
          >
            Lap. Tenis
          </text>
        </g>

        {/* GK1 (Rotate -18deg) */}
        <g
          transform="translate(177.5, 207.5) rotate(-18) translate(-177.5, -207.5)"
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('GK1'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="100"
            y="180"
            width="155"
            height="55"
            rx="8"
            fill="#1e40af"
            fillOpacity={buildingRequests['GK1']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'GK1' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'GK1' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'GK1' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="177"
            y="213"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            GK1
          </text>
        </g>

        {/* GK3 (Rotate -20deg) */}
        <g
          transform="translate(132.5, 292.5) rotate(-20) translate(-132.5, -292.5)"
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('GK3'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="75"
            y="270"
            width="115"
            height="45"
            rx="8"
            fill="#7c3aed"
            fillOpacity={buildingRequests['GK3']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'GK3' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'GK3' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'GK3' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="132"
            y="297"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            GK3
          </text>
        </g>

        {/* GA */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('GA'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="290"
            y="190"
            width="125"
            height="95"
            rx="8"
            fill="#0891b2"
            fillOpacity={buildingRequests['GA']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'GA' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'GA' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'GA' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="352"
            y="242"
            fill="#ffffff"
            fontSize="13"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            GA
          </text>
        </g>

        {/* FWC */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('FWC'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="440"
            y="95"
            width="115"
            height="75"
            rx="8"
            fill="#0d9488"
            fillOpacity={buildingRequests['FWC']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'FWC' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'FWC' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'FWC' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="497"
            y="138"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            FWC
          </text>
        </g>

        {/* PIONEER CHAPEL (PC) */}
        <g
          transform="translate(187.5, 392.5) rotate(-5) translate(-187.5, -392.5)"
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('PC'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="120"
            y="360"
            width="135"
            height="65"
            rx="8"
            fill="#b45309"
            fillOpacity={buildingRequests['PC']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'PC' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'PC' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'PC' ? 'campus-building-selected' : ''}`}
          />
          {/* Triangular roof polygon */}
          <polygon
            points="125,392.5 187.5,365 250,392.5"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            style={{ pointerEvents: 'none' }}
          />
          <text
            x="187"
            y="397"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            Chapel
          </text>
        </g>

        {/* GK2 (Bentuk U - Kiri, Bawah, Kanan) */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('GK2'); }}
          style={{ cursor: 'pointer' }}
        >
          <g
            fill="#2563eb"
            fillOpacity={buildingRequests['GK2']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'GK2' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'GK2' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'GK2' ? 'campus-building-selected' : ''}`}
          >
            {/* Kiri */}
            <rect x="320" y="370" width="30" height="90" rx="4" />
            {/* Bawah */}
            <rect x="320" y="460" width="170" height="30" rx="4" />
            {/* Kanan */}
            <rect x="460" y="370" width="30" height="90" rx="4" />
          </g>
          <text
            x="405"
            y="415"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            GK2
          </text>
        </g>

        {/* SPORT HALL (SH) */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('SH'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="555"
            y="165"
            width="155"
            height="105"
            rx="8"
            fill="#15803d"
            fillOpacity={buildingRequests['SH']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'SH' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'SH' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'SH' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="632"
            y="222"
            fill="#ffffff"
            fontSize="13"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            Sport Hall
          </text>
        </g>

        {/* KANTIN (KT) */}
        <g
          onClick={(e) => { e.stopPropagation(); onSelectBuilding('KT'); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="560"
            y="295"
            width="90"
            height="60"
            rx="8"
            fill="#c2410c"
            fillOpacity={buildingRequests['KT']?.length ? 1 : 0.85}
            stroke={selectedBuilding === 'KT' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={selectedBuilding === 'KT' ? 3 : 1}
            className={`campus-building ${selectedBuilding === 'KT' ? 'campus-building-selected' : ''}`}
          />
          <text
            x="605"
            y="330"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            Kantin
          </text>
        </g>

        {/* PENANDA LAPORAN AKTIF (MARKER PINS) */}
        {Object.entries(buildingsData).map(([key, bData]) => {
          const bReqs = buildingRequests[key] || [];
          const count = bReqs.length;
          if (count === 0) return null;

          const color = getMarkerColor(count);

          return (
            <g
              key={key}
              transform={`translate(${bData.markerX}, ${bData.markerY})`}
              style={{ pointerEvents: 'none' }}
            >
              {/* Outer pulsing halo circle */}
              <circle
                cx="0"
                cy="0"
                r="13"
                fill={color}
                opacity="0.4"
                className="marker-pulse-element"
              />
              {/* Solid pin circle */}
              <circle
                cx="0"
                cy="0"
                r="10"
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
              {/* Counter Text */}
              <text
                x="0"
                y="3"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>

      {/* POPUP DETAIL CARD (MELAYANG DI ATAS PETA) */}
      {selectedBuilding && buildingsData[selectedBuilding] && (
        <div 
          style={getPopupPositionStyle(selectedBuilding)}
          className="popup-window-animation"
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>
                🏢 {buildingsData[selectedBuilding].name}
              </h4>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {buildingsData[selectedBuilding].subLabel}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelectBuilding(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0', paddingTop: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#cbd5e1', marginBottom: '6px' }}>
              Laporan Aktif: <strong style={{ color: (buildingRequests[selectedBuilding]?.length || 0) > 0 ? '#f43f5e' : '#10b981' }}>
                {buildingRequests[selectedBuilding]?.length || 0}
              </strong>
            </div>

            {/* List Tiket Laporan */}
            {buildingRequests[selectedBuilding]?.length > 0 ? (
              <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px', marginBottom: '12px' }}>
                {buildingRequests[selectedBuilding].map((req) => (
                  <div 
                    key={req.id}
                    style={{
                      fontSize: '11px',
                      color: '#cbd5e1',
                      padding: '4px 6px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px'
                    }}>
                      • {req.title}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      background: 
                        req.status === 'SUBMITTED' ? 'rgba(139, 92, 246, 0.25)' :
                        req.status === 'UNDER_REVIEW' ? 'rgba(59, 130, 246, 0.25)' :
                        req.status === 'ASSIGNED' ? 'rgba(16, 185, 129, 0.25)' :
                        req.status === 'IN_PROGRESS' ? 'rgba(245, 158, 11, 0.25)' :
                        'rgba(16, 185, 129, 0.25)',
                      color:
                        req.status === 'SUBMITTED' ? '#a78bfa' :
                        req.status === 'UNDER_REVIEW' ? '#60a5fa' :
                        req.status === 'ASSIGNED' ? '#34d399' :
                        req.status === 'IN_PROGRESS' ? '#fbbf24' :
                        '#34d399',
                    }}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: '0 0 12px 0' }}>
                Tidak ada laporan keluhan aktif di gedung ini.
              </p>
            )}
          </div>

          {/* Action Button */}
          {buildingRequests[selectedBuilding]?.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Tetap pilih gedung untuk memicu filter di list tugas
                onSelectBuilding(selectedBuilding);
              }}
              style={{
                width: '100%',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              Lihat Tugas
            </button>
          )}
        </div>
      )}

      {/* LEGENDA (KIRI BAWAH) */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#e2e8f0', fontWeight: '500' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}></span>
          Tidak ada laporan
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#e2e8f0', fontWeight: '500' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}></span>
          1 - 2 Laporan Aktif
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#e2e8f0', fontWeight: '500' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}></span>
          3+ Laporan Aktif
        </div>
      </div>

      {/* KOMPAS UTARA (KANAN BAWAH) */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        width: '44px',
        height: '44px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        pointerEvents: 'none'
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34">
          <circle cx="17" cy="17" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M17,5 L20,17 L17,14 L14,17 Z" fill="#ef4444" />
          <path d="M17,29 L20,17 L17,14 L14,17 Z" fill="rgba(255,255,255,0.3)" />
          <text x="17" y="11" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">N</text>
        </svg>
      </div>
    </div>
  );
};

export default CampusMap;
