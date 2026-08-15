"use client";

import { useContext, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceContext } from "@/components/experience/ExperienceContext";

const VOID_COLOR = "#ffffff";

const gridVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const gridFragmentShader = /* glsl */ `
  varying vec3 vWorldPosition;

  uniform vec3 uColor;
  uniform float uCellSize;
  uniform float uSectionSize;
  uniform float uFadeDistance;
  uniform float uOpacity;

  float gridLine(float size) {
    vec2 coord = vWorldPosition.xz / size;
    vec2 derivative = fwidth(coord);
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / derivative;
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
  }

  void main() {
    float fine = gridLine(uCellSize);
    float coarse = gridLine(uSectionSize);
    float grid = max(fine * 0.28, coarse);

    float dist = length(vWorldPosition.xz);
    float fade = 1.0 - smoothstep(uFadeDistance * 0.35, uFadeDistance, dist);

    float alpha = grid * fade * uOpacity;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function InfiniteGrid({
  positionY,
  opacity,
  fadeDistance,
}: {
  positionY: number;
  opacity: number;
  fadeDistance: number;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#c5ccd8") },
      uCellSize: { value: 1 },
      uSectionSize: { value: 5 },
      uFadeDistance: { value: fadeDistance },
      uOpacity: { value: opacity },
    }),
    [fadeDistance, opacity],
  );

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, positionY, 0]}>
      <planeGeometry args={[120, 120, 1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
      />
    </mesh>
  );
}

function hashedUnit(index: number, salt: number) {
  const n = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 320;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (hashedUnit(i, 1) - 0.5) * 48;
      positions[i * 3 + 1] = hashedUnit(i, 2) * 14 + 0.2;
      positions[i * 3 + 2] = (hashedUnit(i, 3) - 0.5) * 48;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;

    points.rotation.y = state.clock.elapsedTime * 0.01;
    points.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#aeb6c4"
        size={0.038}
        sizeAttenuation
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </points>
  );
}

function ScanSweep() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = (state.clock.elapsedTime * 0.08) % 1;
    mesh.position.z = THREE.MathUtils.lerp(20, -20, t);

    const material = mesh.material as THREE.MeshBasicMaterial;
    material.opacity = 0.025 + Math.sin(t * Math.PI) * 0.04;
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
      <planeGeometry args={[50, 0.12]} />
      <meshBasicMaterial
        color="#8e99ab"
        transparent
        opacity={0.04}
        depthWrite={false}
      />
    </mesh>
  );
}

function CameraDrift() {
  const experience = useContext(ExperienceContext);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * 0.06;
    const phase = experience?.phase ?? "boot";
    const pointer = experience?.pointer.current ?? { x: 0, y: 0 };
    const hover = phase === "console" ? 1 : 0;
    const splash = phase === "splash" ? 1 : 0;
    const targetX = Math.sin(t) * 1.05 + pointer.x * 1.5 * hover;
    const targetY = 2.7 + Math.sin(t * 0.55) * 0.12 + pointer.y * 0.45 * hover;
    const targetZ = 10.5 - splash * 3.4 - hover * 0.8;
    const step = 1 - Math.exp(-(splash ? 3.4 : 1.6) * delta);

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetX,
      step,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetY,
      step,
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      step,
    );
    state.camera.lookAt(pointer.x * 0.8 * hover, 1.15, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={[VOID_COLOR]} />
      <fog attach="fog" args={[VOID_COLOR, 8, 32]} />
      <ambientLight intensity={1.4} />
      <InfiniteGrid positionY={0} opacity={0.7} fadeDistance={36} />
      <InfiniteGrid positionY={16} opacity={0.28} fadeDistance={30} />
      <FloatingParticles />
      <ScanSweep />
      <CameraDrift />
    </>
  );
}

export default function DigitalWhiteSpaceScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.7, 10.5], fov: 46, near: 0.1, far: 80 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
