'use client';

import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { BoxSelect, Sparkles } from 'lucide-react';

export type WalkthroughStop = {
  id: string;
  label: string;
  src: string;
  position: [number, number, number];
};

type HouseWalkthroughProps = {
  stops: WalkthroughStop[];
};

function VillaMass({
  stops,
  activeId,
  onSelect,
}: {
  stops: WalkthroughStop[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <group>
      {/* Ground / deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#d6d1c4" />
      </mesh>

      {/* Pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2.6]} receiveShadow>
        <planeGeometry args={[5.5, 2.4]} />
        <meshStandardMaterial color="#1d6fa5" metalness={0.2} roughness={0.25} />
      </mesh>

      {/* Main volume */}
      <mesh position={[0, 1.1, -0.6]} castShadow>
        <boxGeometry args={[5.2, 2.2, 3.2]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>

      {/* Upper volume */}
      <mesh position={[0.4, 2.55, -0.8]} castShadow>
        <boxGeometry args={[3.6, 1.1, 2.4]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>

      {/* Wood soffit accent */}
      <mesh position={[0, 2.05, 0.95]} castShadow>
        <boxGeometry args={[5.0, 0.12, 0.7]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>

      {/* Glass front hint */}
      <mesh position={[0, 1.0, 1.01]}>
        <boxGeometry args={[4.4, 1.6, 0.08]} />
        <meshStandardMaterial color="#9ec9e6" transparent opacity={0.55} metalness={0.4} roughness={0.1} />
      </mesh>

      {stops.map((stop) => {
        const isActive = stop.id === activeId;
        return (
          <group key={stop.id} position={stop.position}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect(stop.id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial
                color={isActive ? '#0284c7' : '#ffffff'}
                emissive={isActive ? '#0369a1' : '#64748b'}
                emissiveIntensity={isActive ? 0.55 : 0.2}
              />
            </mesh>
            <Html distanceFactor={8} position={[0, 0.35, 0]} center>
              <button
                type="button"
                onClick={() => onSelect(stop.id)}
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold shadow ${
                  isActive ? 'bg-primary-600 text-white' : 'bg-white/95 text-gray-800'
                }`}
              >
                {stop.label}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function HouseWalkthrough({ stops }: HouseWalkthroughProps) {
  const [activeId, setActiveId] = useState(stops[0]?.id || '');
  const active = useMemo(
    () => stops.find((s) => s.id === activeId) || stops[0],
    [activeId, stops],
  );

  if (!active) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <BoxSelect className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">3D walkthrough</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          <Sparkles className="h-3 w-3" /> Demo · AI visualization
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative min-h-[260px] bg-gradient-to-b from-sky-100 to-stone-200 lg:min-h-[340px]">
          <Canvas camera={{ position: [6.5, 4.2, 6.5], fov: 42 }} shadows dpr={[1, 1.75]}>
            <ambientLight intensity={0.7} />
            <directionalLight castShadow position={[6, 10, 4]} intensity={1.1} />
            <Suspense fallback={null}>
              <VillaMass stops={stops} activeId={active.id} onSelect={setActiveId} />
              <ContactShadows opacity={0.35} scale={12} blur={2.2} far={6} />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minPolarAngle={0.35}
              maxPolarAngle={Math.PI / 2.15}
              minDistance={5}
              maxDistance={12}
            />
          </Canvas>
          <p className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-gray-600">
            Drag to orbit · tap hotspots
          </p>
        </div>

        <div className="flex flex-col">
          <div className="relative flex-1 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.label}
              className="h-56 w-full object-cover sm:h-64 lg:h-full lg:min-h-[340px]"
            />
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active.label}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gray-100 p-3">
            {stops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveId(stop.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  stop.id === active.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stop.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
