"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Preload, BakeShadows } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { MotionValue } from "framer-motion";
import { damp, damp3, dampE } from "maath/easing"; // for buttery smooth physics

// ── Palette ──────────────────────────────────────────────────────────
const C_CYAN   = new THREE.Color("#00d4ff");
const C_ORANGE = new THREE.Color("#F26F21");
const C_WHITE  = new THREE.Color("#ffffff");

// ─────────────────────────────────────────────────────────────────────
// HELPERS — reusable plane/box mesh builders
// ─────────────────────────────────────────────────────────────────────
const Plane = ({ pos, size, color, opacity, intensity = 1 }: { pos: [number, number, number]; size: [number, number]; color: THREE.Color; opacity: number; intensity?: number }) => (
  <mesh position={pos}>
    <planeGeometry args={size} />
    {/* Use meshBasicMaterial but boost color above 1.0 for Bloom threshold if intensity > 1 */}
    <meshBasicMaterial 
      color={intensity > 1 ? color.clone().multiplyScalar(intensity) : color} 
      transparent 
      opacity={opacity} 
      depthWrite={false} 
    />
  </mesh>
);

function BackgroundPlane() {
  return (
    <mesh position={[0, 0, -8]}>
      <planeGeometry args={[140, 60]} />
      <meshBasicMaterial color={new THREE.Color("#030712")} />
    </mesh>
  );
}

const STAR_COUNT = 800;
const STAR_POSITIONS = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  STAR_POSITIONS[i * 3]     = (Math.random() - 0.5) * 60;
  STAR_POSITIONS[i * 3 + 1] = (Math.random() - 0.5) * 40;
  STAR_POSITIONS[i * 3 + 2] = -5 - Math.random() * 20;
}

function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(STAR_POSITIONS, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.002;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.06} color={new THREE.Color("#8ab4d4")} transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame(({ clock }) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      if (material) {
        material.opacity = 0.12 + Math.sin(clock.elapsedTime * 0.4) * 0.06;
      }
    }
  });

  return (
    <gridHelper ref={gridRef} args={[40, 40, "#001a3b", "#000814"]} position={[0, -4.5, 0]}>
      <lineBasicMaterial attach="material" transparent opacity={0.15} vertexColors toneMapped={false} />
    </gridHelper>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4. ENERGY RIBBON — Uses high intensity color to trigger Bloom
// ─────────────────────────────────────────────────────────────────────
function EnergyRibbon({ color, speed = 0.22, tiltX = 0.4, tiltZ = 0.15, radiusX = 3.8, radiusY = 1.4, radiusZ = 2.2, tubeRadius = 0.022, opacity = 0.8, glowOpacity = 0.15 }: { color: THREE.Color, speed?: number, tiltX?: number, tiltZ?: number, radiusX?: number, radiusY?: number, radiusZ?: number, tubeRadius?: number, opacity?: number, glowOpacity?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { innerGeo, outerGeo } = useMemo(() => {
    const SEGS = 320;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGS; i++) {
      const t = (i / SEGS) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * radiusX, Math.sin(t * 1.5) * radiusY, Math.sin(t) * radiusZ));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return {
      innerGeo: new THREE.TubeGeometry(curve, 320, tubeRadius, 8, true),
      outerGeo: new THREE.TubeGeometry(curve, 320, tubeRadius * 4.5, 8, true),
    };
  }, [radiusX, radiusY, radiusZ, tubeRadius]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * speed;
    groupRef.current.rotation.x = tiltX;
    groupRef.current.rotation.z = tiltZ;
  });

  // Multiply color by 4.0 to make it glow brightly via PostProcessing Bloom
  const bloomColor = useMemo(() => color.clone().multiplyScalar(4.0), [color]);

  return (
    <group ref={groupRef}>
      <mesh geometry={innerGeo}>
        <meshBasicMaterial color={bloomColor} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh geometry={outerGeo}>
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5. SHADOW CARD
// ─────────────────────────────────────────────────────────────────────
function ShadowCard({ opacity = 0.28, edgeOpacity = 0.35 }: { opacity?: number, edgeOpacity?: number }) {
  const W = 2.85, H = 4.05;
  return (
    <group>
      <mesh>
        <boxGeometry args={[W, H, 0.05]} />
        <meshPhysicalMaterial
          color={new THREE.Color("#040b17")}
          roughness={0.02}
          transmission={0.92}
          ior={1.5}
          thickness={0.1}
          clearcoat={1.0}
          envMapIntensity={2.0}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Plane pos={[0,  H/2+0.018, 0.028]} size={[W+0.036, 0.028]} color={C_CYAN} opacity={edgeOpacity} intensity={2} />
      <Plane pos={[0, -H/2-0.018, 0.028]} size={[W+0.036, 0.028]} color={C_CYAN} opacity={edgeOpacity * 0.6} intensity={2} />
      <Plane pos={[-W/2-0.018, 0, 0.028]} size={[0.028, H]} color={C_CYAN} opacity={edgeOpacity * 0.7} intensity={2} />
      <Plane pos={[ W/2+0.018, 0, 0.028]} size={[0.028, H]} color={C_CYAN} opacity={edgeOpacity * 0.7} intensity={2} />
      {[-0.5, 0.1, 0.7, -1.1, -1.6].map((y, i) => (
        <Plane key={i} pos={[0, y, 0.029]} size={[1.8 + (i % 3) * 0.35, 0.045]} color={C_WHITE} opacity={0.08 + (i % 2) * 0.04} />
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6. SCAN LINE
// ─────────────────────────────────────────────────────────────────────
function ScanLine({ currentPhase }: { currentPhase: number }) {
  const beam  = useRef<THREE.Mesh>(null);
  const glow  = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  const CARD_H = 4.05;
  
  // Bloom intensity target
  const activeColor = useMemo(() => C_CYAN.clone().multiplyScalar(6.0), []);

  useFrame(({ clock }, delta) => {
    // Easing the period for smooth transitions between phases
    const targetPeriod = currentPhase === 1 ? 1.8 : 4.5;
    beam.current!.userData.period = beam.current!.userData.period || targetPeriod;
    damp(beam.current!.userData, 'period', targetPeriod, 0.5, delta);
    
    const PERIOD = beam.current!.userData.period;
    const t = (clock.elapsedTime % PERIOD) / PERIOD;
    const y = CARD_H / 2 - t * CARD_H;
    const fade = t < 0.06 ? t / 0.06 : t > 0.88 ? (1 - t) / 0.12 : 1;

    if (beam.current) {
      beam.current.position.y = y;
      (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.95 * fade;
    }
    if (glow.current) {
      glow.current.position.y = y;
      (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * fade;
    }
    if (trail.current) {
      trail.current.scale.y = Math.max(t, 0.001);
      trail.current.position.y = CARD_H / 2 - (t * CARD_H) / 2;
      (trail.current.material as THREE.MeshBasicMaterial).opacity = 0.08 * (1 - t * 0.6);
    }
  });

  return (
    <group>
      <mesh ref={beam} position={[0, 2.0, 0.048]}>
        <planeGeometry args={[2.82, 0.026]} />
        <meshBasicMaterial color={activeColor} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={glow} position={[0, 2.0, 0.044]}>
        <planeGeometry args={[2.95, 0.60]} />
        <meshBasicMaterial color={C_CYAN} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={trail} position={[0, 0, 0.040]}>
        <planeGeometry args={[2.82, CARD_H]} />
        <meshBasicMaterial color={C_CYAN} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7. MAIN CV DOCUMENT
// ─────────────────────────────────────────────────────────────────────
function CVDocument({ currentPhase }: { currentPhase: number }) {
  const CARD_W = 2.85;
  const CARD_H = 4.05;
  const BAR_W  = 2.28;
  const skills = [0.88, 0.78, 0.67, 0.54];
  const edgeColor = useMemo(() => C_CYAN.clone().multiplyScalar(2.0), []);

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[CARD_W, CARD_H, 0.07]} />
        <meshPhysicalMaterial
          color={new THREE.Color("#020814")}
          roughness={0.015}
          transmission={0.88}
          ior={1.55}
          thickness={0.08}
          clearcoat={1.0}
          envMapIntensity={3.5} // Higher intensity for premium glass look
          transparent
          opacity={0.96}
        />
      </mesh>

      <Plane pos={[0, 0, 0.037]} size={[CARD_W, CARD_H]} color={new THREE.Color("#001428")} opacity={0.32} />

      {[
        { p: [0,  CARD_H/2+0.018, 0.038] as [number,number,number], s: [CARD_W+0.036, 0.030] as [number,number] },
        { p: [0, -CARD_H/2-0.018, 0.038] as [number,number,number], s: [CARD_W+0.036, 0.030] as [number,number] },
        { p: [-CARD_W/2-0.018, 0, 0.038] as [number,number,number], s: [0.030, CARD_H] as [number,number] },
        { p: [ CARD_W/2+0.018, 0, 0.038] as [number,number,number], s: [0.030, CARD_H] as [number,number] },
      ].map(({ p, s }, i) => (
        <mesh key={`e${i}`} position={p}>
          <planeGeometry args={s} />
          <meshBasicMaterial color={edgeColor} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}

      {([
        [ CARD_W/2-0.04,  CARD_H/2-0.04, 0.040],
        [-CARD_W/2+0.04,  CARD_H/2-0.04, 0.040],
        [ CARD_W/2-0.04, -CARD_H/2+0.04, 0.040],
        [-CARD_W/2+0.04, -CARD_H/2+0.04, 0.040],
      ] as [number,number,number][]).map((pos, i) => (
        <mesh key={`d${i}`} position={pos}>
          <circleGeometry args={[0.056, 16]} />
          <meshBasicMaterial color={i < 2 ? C_ORANGE.clone().multiplyScalar(3) : edgeColor} transparent opacity={0.90} depthWrite={false} />
        </mesh>
      ))}

      {/* Header */}
      <Plane pos={[0, 1.67, 0.037]} size={[2.78, 0.66]} color={new THREE.Color("#040d1f")} opacity={0.82} />
      <mesh position={[-1.00, 1.66, 0.041]}>
        <ringGeometry args={[0.215, 0.238, 32]} />
        <meshBasicMaterial color={C_CYAN} transparent opacity={0.65} depthWrite={false} />
      </mesh>
      <Plane pos={[0.18, 1.83, 0.041]} size={[1.38, 0.10]} color={C_WHITE}  opacity={0.78} />
      <Plane pos={[0.06, 1.66, 0.041]} size={[0.88, 0.062]} color={C_ORANGE} opacity={0.80} />
      
      {/* Content Lines */}
      {[{y:0.96,w:2.35},{y:0.82,w:1.98},{y:0.68,w:2.22},{y:0.04,w:2.28},{y:-0.09,w:1.82}].map(({y,w},i) => (
        <Plane key={`l${i}`} pos={[0,y,0.039]} size={[w,0.052]} color={C_WHITE} opacity={0.22} />
      ))}

      {/* Skills Bars */}
      {skills.map((fill, i) => {
        const y = -0.64 - i * 0.23;
        const fillW = BAR_W * fill;
        return (
          <group key={`s${i}`}>
            <Plane pos={[0, y, 0.039]} size={[BAR_W, 0.044]} color={C_WHITE} opacity={0.06} />
            <Plane pos={[-(BAR_W-fillW)/2, y, 0.040]} size={[fillW, 0.044]} color={C_CYAN} opacity={0.50} />
            <Plane pos={[-(BAR_W-fillW)/2 + fillW/2, y, 0.041]} size={[fillW, 0.044]} color={C_CYAN} opacity={0.80} intensity={2} />
          </group>
        );
      })}

      <ScanLine currentPhase={currentPhase} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8. ATS SCORE PANEL (Transform HTML for 3D immersion)
// ─────────────────────────────────────────────────────────────────────
function ScorePanel({ currentPhase }: { currentPhase: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const highlighted = currentPhase === 3;

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    // Spring physics for smooth floating
    const targetY = 0.85 + Math.sin(clock.elapsedTime * 0.66) * 0.055;
    damp(groupRef.current.position, 'y', targetY, 0.25, delta);
    
    // Scale up slightly when highlighted
    const targetScale = highlighted ? 1.05 : 1.0;
    damp3(groupRef.current.scale, [targetScale, targetScale, targetScale], 0.2, delta);
  });

  return (
    <group ref={groupRef} position={[2.1, 0.85, 0.3]} rotation={[0, -0.15, 0]}>
      {/* HTML transform makes it exist IN the 3D space, respecting camera depth & rotation */}
      <Html transform distanceFactor={3.8} style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "'Geist Mono', 'Courier New', monospace",
          color: "#00d4ff",
          background: "rgba(3, 8, 22, 0.75)", // More transparent for WebGL blend
          border: `1px solid ${highlighted ? "rgba(0,212,255,0.8)" : "rgba(0,212,255,0.35)"}`,
          borderRadius: "12px",
          padding: "16px 20px",
          width: "180px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: highlighted
            ? "0 0 40px rgba(0,212,255,0.4), inset 0 0 20px rgba(0,212,255,0.15)"
            : "0 0 14px rgba(0,212,255,0.10)",
          fontSize: "11px",
          lineHeight: 1.55,
          transition: "border-color 0.4s ease-out, box-shadow 0.4s ease-out",
        }}>
          <div style={{ color: "rgba(0,212,255,0.5)", fontSize: "9px", letterSpacing: "0.15em", marginBottom: "8px" }}>
            {"// ATS SCORE"}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "6px", color: highlighted ? "#fff" : "rgba(0,212,255,0.90)", textShadow: highlighted ? "0 0 12px rgba(0,212,255,0.8)" : "none" }}>
            91.3%
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "10px", overflow: "hidden" }}>
            <div style={{ width: "91.3%", height: "100%", background: "linear-gradient(90deg, #00d4ff, #fff)", borderRadius: "2px", boxShadow: highlighted ? "0 0 8px rgba(0,212,255,0.8)" : "none" }} />
          </div>
          <div style={{ color: "#F26F21", fontSize: "10px", letterSpacing: "0.08em", fontWeight: "bold", marginBottom: "10px", textShadow: "0 0 8px rgba(242,111,33,0.4)" }}>
            ✓ VƯỢT QUA ATS
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
            {[["Keywords","47/51"],["Format","A+"],["Length","✓"]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"rgba(255,255,255,0.4)", lineHeight: 2.2 }}>
                <span>{l}</span>
                <span style={{ color:"rgba(0,212,255,0.8)", fontWeight: "500" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 10. CV STACK (maath dampening)
// ─────────────────────────────────────────────────────────────────────
function CVStack({ scrollYProgress, currentPhase }: { scrollYProgress: MotionValue<number>; currentPhase: number }) {
  const stackRef   = useRef<THREE.Group>(null);
  const layer1Ref  = useRef<THREE.Group>(null);
  const layer2Ref  = useRef<THREE.Group>(null);

  useFrame(({ pointer, clock }, delta) => {
    if (!stackRef.current || !layer1Ref.current || !layer2Ref.current) return;
    const t = clock.elapsedTime;

    // Smooth Mouse Parallax
    const targetRotX = -pointer.y * 0.15 + Math.sin(t * 0.4) * 0.02;
    const targetRotY =  pointer.x * 0.18 + Math.cos(t * 0.3) * 0.02;
    dampE(stackRef.current.rotation, [targetRotX, targetRotY, 0], 0.3, delta);
    damp(stackRef.current.position, 'y', Math.sin(t * 0.5) * 0.08, 0.4, delta);

    // Smooth Scroll Depth
    const s = scrollYProgress.get();
    let targetZ = 0;
    if (s > 0.28) targetZ = -1.1 * Math.min((s - 0.28) * 3.6, 1);
    if (s > 0.82) targetZ += 1.1 * Math.min((s - 0.82) * 5.0, 1);
    damp(stackRef.current.position, 'z', targetZ, 0.25, delta);

    // Smooth Phase Separation
    const isScanning = currentPhase >= 1 && currentPhase <= 3;
    const sep = isScanning ? 1.0 : 0.0;

    // Layer 1
    damp3(layer1Ref.current.position, [0.09 + sep * 0.18, -0.11 - sep * 0.12, -0.26 - sep * 0.6], 0.35, delta);
    dampE(layer1Ref.current.rotation, [0, 0, sep * -0.025], 0.35, delta);

    // Layer 2
    damp3(layer2Ref.current.position, [0.18 + sep * 0.38, -0.22 - sep * 0.28, -0.52 - sep * 1.3], 0.4, delta);
    dampE(layer2Ref.current.rotation, [0, sep * 0.08, sep * -0.05], 0.4, delta);
  });

  return (
    <group ref={stackRef}>
      <group ref={layer2Ref}><ShadowCard opacity={0.22} edgeOpacity={0.25} /></group>
      <group ref={layer1Ref}><ShadowCard opacity={0.36} edgeOpacity={0.40} /></group>
      <CVDocument currentPhase={currentPhase} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCENE + POST-PROCESSING
// ─────────────────────────────────────────────────────────────────────
// PostProcessing effects cast to 'any' to bypass React 19 typing mismatches
// PostProcessing effects cast to 'any' to bypass React 19 typing mismatches

function Scene({ scrollYProgress, currentPhase }: { scrollYProgress: MotionValue<number>; currentPhase: number }) {
  const { camera, viewport } = useThree();

  useFrame(({ pointer }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const s = scrollYProgress.get();

    let targetZ = 6.5;
    if (s > 0.70) targetZ = 6.5 + (s - 0.70) * 7;
    
    const isMobile = viewport.aspect < 1;
    const baseOffsetX = isMobile ? 0 : -2.2; // Slightly more left room
    const targetX = baseOffsetX + pointer.x * (isMobile ? 0.1 : 0.3);
    const targetY = pointer.y * 0.15;
    
    damp3(cam.position, [targetX, targetY, targetZ], 0.3, delta);
    cam.lookAt(targetX * 0.35, 0, 0); 
  });

  return (
    <>
      <Environment preset="city" /> {/* City gives better specular reflections on glass than night */}
      <BackgroundPlane />
      <Starfield />
      <GridFloor />

      {/* Lighting */}
      <ambientLight intensity={0.25} color="#04101e" />
      <pointLight position={[ 0, 0, 5]}  intensity={3.8} color={C_CYAN} distance={25} decay={2} />
      <pointLight position={[-4, 4, 3]}  intensity={2.8} color={C_ORANGE} distance={20} decay={2} />
      <pointLight position={[ 4,-3, 3]}  intensity={2.0} color="#3344cc" distance={20} decay={2} />
      
      {/* Cinematic Highlight Light — moves across the glass */}
      <spotLight position={[5, 5, 2]} intensity={5.0} color="#ffffff" angle={0.2} penumbra={1} distance={20} decay={1.5} />

      <EnergyRibbon color={C_CYAN} speed={0.20} tiltX={0.32} tiltZ={0.12} radiusX={3.9} radiusY={1.5} radiusZ={2.3} tubeRadius={0.020} opacity={0.8} />
      <EnergyRibbon color={C_ORANGE} speed={-0.15} tiltX={0.62} tiltZ={-0.22} radiusX={3.4} radiusY={1.2} radiusZ={2.7} tubeRadius={0.018} opacity={0.6} />
      <EnergyRibbon color={C_CYAN} speed={0.10} tiltX={-0.45} tiltZ={0.30} radiusX={4.5} radiusY={0.9} radiusZ={1.8} tubeRadius={0.010} opacity={0.4} />

      <ScorePanel currentPhase={currentPhase} />
      <CVStack scrollYProgress={scrollYProgress} currentPhase={currentPhase} />

      <PostProcessing />
    </>
  );
}

function PostProcessing() {
  return (
    // @ts-expect-error - React 19 type mismatch in EffectComposer
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur={true} />
      <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.1} darkness={0.9} />
      <Noise opacity={0.025} />
    </EffectComposer>
  );
}

export const WebGLCVScene = ({ scrollYProgress, currentPhase = 0 }: { scrollYProgress: MotionValue<number>; currentPhase?: number }) => (
  <div className="w-full h-full relative pointer-events-auto">
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 44 }}
      gl={{ antialias: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      dpr={[1, 1.5]}
    >
      <React.Suspense fallback={null}>
        <Scene scrollYProgress={scrollYProgress} currentPhase={currentPhase} />
        <Preload all />
        <BakeShadows />
      </React.Suspense>
    </Canvas>
  </div>
);
