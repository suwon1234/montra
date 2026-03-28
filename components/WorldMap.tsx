'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3-geo';
import { motion, AnimatePresence } from 'motion/react';
import { nativeNames } from '@/lib/countries';
import { getCountryColor } from '@/lib/colors';
import { getFlagUrl, countryToCode } from '@/lib/country-codes';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export default function WorldMap() {
  const router = useRouter();
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        const filteredFeatures = data.features.filter((f: any) => f.properties.name !== "Antarctica");
        setGeoData({ ...data, features: filteredFeatures });
        setLoading(false);
      })
      .catch(err => {
        console.error("Map Load Error:", err);
        setLoading(false);
      });

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projection = useMemo(() => {
    const p = d3.geoNaturalEarth1()
      .scale(dimensions.width / 4.5)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    return p;
  }, [dimensions]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-black/30 animate-[pulse_1.2s_ease-in-out_0s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-black/30 animate-[pulse_1.2s_ease-in-out_0.2s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-black/30 animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    );
  }

  // Compute overlay data outside JSX to keep it clean
  const overlayPath = hoveredCountry ? pathGenerator(hoveredCountry) : null;
  const overlayCentroid = hoveredCountry ? pathGenerator.centroid(hoveredCountry) : null;
  const overlayCx = overlayCentroid && isFinite(overlayCentroid[0]) ? overlayCentroid[0] : 0;
  const overlayCy = overlayCentroid && isFinite(overlayCentroid[1]) ? overlayCentroid[1] : 0;
  const overlayColor = hoveredCountry ? getCountryColor(hoveredCountry.properties.name) : '#000';
  const flagUrl = hoveredCountry ? getFlagUrl(hoveredCountry.properties.name) : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-visible"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredCountry(null)}
    >
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Base layer: all countries in stable order, no re-sorting */}
        <g>
          {geoData?.features.map((feature: any, i: number) => {
            const countryName = feature.properties.name;
            const isHovered = hoveredCountry?.properties.name === countryName;
            const path = pathGenerator(feature);
            if (!path) return null;

            return (
              <path
                key={countryName + i}
                d={path}
                fill={isHovered ? getCountryColor(countryName) : '#E5E5E5'}
                stroke={isHovered ? getCountryColor(countryName) : '#FFFFFF'}
                strokeWidth={0.5}
                onClick={() => {
                  const code = countryToCode[countryName];
                  if (code) {
                    router.push(`/country/${code}`);
                  }
                }}
                onMouseEnter={() => setHoveredCountry(feature)}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'fill 0.2s ease, stroke 0.2s ease',
                }}
              />
            );
          })}
        </g>

        {/* Overlay layer: hovered country rendered on top with lift effect */}
        {hoveredCountry && overlayPath && (
          <g style={{ pointerEvents: 'none' }}>
            <path
              d={overlayPath}
              fill={overlayColor}
              stroke="white"
              strokeWidth={1.5}
              style={{
                transformOrigin: `${overlayCx}px ${overlayCy}px`,
                transform: 'scale(1.04) translateY(-8px)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
                filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.3)) drop-shadow(0 2px 6px ${overlayColor}55)`,
              }}
            />
          </g>
        )}
      </svg>

      {/* Tooltip — glassmorphism */}
      <AnimatePresence>
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: mousePos.x + 20,
              top: mousePos.y - 40,
              pointerEvents: 'none',
              zIndex: 100,
            }}
            className="relative overflow-hidden rounded-xl shadow-2xl border border-white/10 min-w-[160px] text-white"
          >
            {/* 국기 배경 이미지 */}
            {flagUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url(${flagUrl})` }}
              />
            )}
            {/* 어두운 오버레이 — backdrop-blur 제거 (국기 흐려짐 방지) */}
            <div className="absolute inset-0 bg-black/35" />
            {/* 텍스트 콘텐츠 */}
            <div className="relative z-10 px-5 py-3 flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-50 font-mono mb-1">
                {hoveredCountry.properties.name}
              </span>
              <span className="text-lg font-serif italic">
                {nativeNames[hoveredCountry.properties.name] || hoveredCountry.properties.name}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
