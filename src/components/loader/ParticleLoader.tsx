"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience, type ExperiencePhase } from "@/components/experience/ExperienceContext";

const CLOUD_COUNT = 760;
const RING_COUNT = 220;
const TOTAL = CLOUD_COUNT + RING_COUNT;
const BOOT_MS = 4200;
const SPLASH_MS = 1700;

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (280.0 / -mvPosition.z);
    vAlpha = 1.0;
  }
`;

const particleFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, uOpacity * core);
  }
`;

function hashedUnit(index: number, salt: number) {
  const n = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function createParticleLayout() {
  const positions = new Float32Array(TOTAL * 3);
  const homes = new Float32Array(TOTAL * 3);
  const colors = new Float32Array(TOTAL * 3);
  const sizes = new Float32Array(TOTAL);
  const seeds = new Float32Array(TOTAL);

  for (let i = 0; i < CLOUD_COUNT; i += 1) {
    const theta = hashedUnit(i, 1) * Math.PI * 2;
    const phi = Math.acos(hashedUnit(i, 2) * 2 - 1);
    const radius = 1.6 + hashedUnit(i, 3) * 4.8;
    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.sin(phi) * Math.sin(theta) * radius * 0.72;
    const z = Math.cos(phi) * radius;
    positions.set([x, y, z], i * 3);
    homes.set([x, y, z], i * 3);
    const tint = 0.55 + hashedUnit(i, 4) * 0.45;
    colors.set([0.07 * tint, 0.72 * tint, 0.86 * tint], i * 3);
    sizes[i] = 7 + hashedUnit(i, 5) * 9;
    seeds[i] = hashedUnit(i, 6);
  }

  for (let i = 0; i < RING_COUNT; i += 1) {
    const index = CLOUD_COUNT + i;
    const angle = (i / RING_COUNT) * Math.PI * 2;
    const ring = 1.35 + hashedUnit(index, 1) * 0.55;
    const x = Math.cos(angle) * ring;
    const y = Math.sin(angle) * ring * 0.42;
    const z = (hashedUnit(index, 2) - 0.5) * 0.2;
    positions.set([x, y, z], index * 3);
    homes.set([x, y, z], index * 3);
    colors.set([0.18, 0.86, 1.0], index * 3);
    sizes[index] = 8 + hashedUnit(index, 3) * 6;
    seeds[index] = hashedUnit(index, 4);
  }

  return { positions, homes, colors, sizes, seeds };
}

function ParticleSystem({
  phase,
  onBootComplete,
  onSplashComplete,
}: {
  phase: ExperiencePhase;
  onBootComplete: () => void;
  onSplashComplete: () => void;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const cursorRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const phaseRef = useRef(phase);
  const splashStarted = useRef(false);
  const bootDone = useRef(false);
  const splashDone = useRef(false);
  const bootStart = useRef<number | null>(null);
  const splashStart = useRef<number | null>(null);
  const { pointer, camera, gl } = useThree();
  const experience = useExperience();

  const layout = useMemo(() => createParticleLayout(), []);
  const velocities = useMemo(() => new Float32Array(TOTAL * 3), []);
  const cursor = useMemo(() => new THREE.Vector3(), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(layout.positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(layout.colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(layout.sizes, 1));
    return geo;
  }, [layout]);

  const linePositions = useMemo(() => new Float32Array(240 * 6), []);
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [linePositions]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "boot") {
      bootDone.current = false;
    }
    if (phase === "splash") {
      splashStart.current = performance.now();
      splashStarted.current = false;
      splashDone.current = false;
    }
  }, [phase]);

  useFrame((state) => {
    const points = pointsRef.current;
    const mat = materialRef.current;
    if (!points || !mat) return;

    const positions = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const colors = points.geometry.getAttribute("aColor") as THREE.BufferAttribute;
    const sizes = points.geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const now = performance.now();
    const currentPhase = phaseRef.current;

    camera.getWorldDirection(forward);
    cursor.set(pointer.x * 4.2, pointer.y * 2.4, 0.9);
    experience.pointer.current.x = pointer.x;
    experience.pointer.current.y = pointer.y;

    const hovering = pointer.x !== 0 || pointer.y !== 0;
    const hoverStrength = hovering && currentPhase === "boot" ? 1 : 0;

    if (cursorRef.current) {
      cursorRef.current.position.lerp(cursor, 0.18);
      cursorRef.current.visible = currentPhase === "boot" && hovering;
      cursorRef.current.rotation.z = state.clock.elapsedTime * 1.4;
    }

    if (currentPhase === "splash" && !splashStarted.current) {
      splashStarted.current = true;
      for (let i = 0; i < TOTAL; i += 1) {
        const ix = i * 3;
        scratch.set(positions.getX(i), positions.getY(i), positions.getZ(i));
        scratch.sub(camera.position);
        scratch.z *= 0.15;
        if (scratch.lengthSq() < 0.0001) {
          scratch.set(layout.seeds[i] - 0.5, hashedUnit(i, 9) - 0.5, 0);
        }
        scratch.normalize();
        const burst = 5.5 + layout.seeds[i] * 7.5;
        velocities[ix] = scratch.x * burst + forward.x * (9 + layout.seeds[i] * 6);
        velocities[ix + 1] = scratch.y * burst + forward.y * (9 + layout.seeds[i] * 6);
        velocities[ix + 2] = scratch.z * burst + forward.z * (11 + layout.seeds[i] * 8);
      }
    }

    if (currentPhase === "boot" && bootStart.current === null) {
      bootStart.current = now;
    }

    const splashT =
      currentPhase === "splash" && splashStart.current
        ? Math.min(1, (now - splashStart.current) / SPLASH_MS)
        : 0;
    const splashEase = splashT * splashT;

    if (currentPhase === "splash") {
      camera.position.z = THREE.MathUtils.lerp(7.2, 2.8, splashEase);
      camera.fov = THREE.MathUtils.lerp(48, 26, splashEase);
      camera.updateProjectionMatrix();
      mat.uniforms.uOpacity.value = 1 - splashT;
    } else if (currentPhase === "boot") {
      camera.position.z = 7.2;
      camera.fov = 48;
      camera.updateProjectionMatrix();
      mat.uniforms.uOpacity.value = 1;
    }

    let lineCount = 0;

    for (let i = 0; i < TOTAL; i += 1) {
      const ix = i * 3;
      let x = positions.getX(i);
      let y = positions.getY(i);
      let z = positions.getZ(i);

      if (currentPhase === "splash") {
        x += velocities[ix] * 0.016;
        y += velocities[ix + 1] * 0.016;
        z += velocities[ix + 2] * 0.016;
        velocities[ix] *= 0.992;
        velocities[ix + 1] *= 0.992;
        velocities[ix + 2] *= 0.992;
        colors.setXYZ(i, 0.55, 0.95, 1.0);
        sizes.array[i] = layout.sizes[i] * (1.2 + splashT * 1.8);
      } else {
        const hx = layout.homes[ix];
        const hy = layout.homes[ix + 1];
        const hz = layout.homes[ix + 2];
        const swirl = state.clock.elapsedTime * (0.18 + layout.seeds[i] * 0.12);
        const homeX = hx * Math.cos(swirl * 0.15) - hz * Math.sin(swirl * 0.15);
        const homeZ = hx * Math.sin(swirl * 0.15) + hz * Math.cos(swirl * 0.15);

        x += (homeX - x) * 0.045;
        y += (hy - y) * 0.045;
        z += (homeZ - z) * 0.045;

        const dx = x - cursor.x;
        const dy = y - cursor.y;
        const dz = z - cursor.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;

        if (hoverStrength && dist < 2.1) {
          const force = 1 - dist / 2.1;
          const angle = layout.seeds[i] * Math.PI * 2 + state.clock.elapsedTime * 2.4;
          const ring = 0.42 + layout.seeds[i] * 0.28;
          const tx = cursor.x + Math.cos(angle) * ring;
          const ty = cursor.y + Math.sin(angle) * ring;
          const tz = cursor.z + Math.sin(angle * 1.6) * 0.12;
          x += (tx - x) * (0.14 * force);
          y += (ty - y) * (0.14 * force);
          z += (tz - z) * (0.14 * force);
          x += -dy * 0.03 * force;
          y += dx * 0.03 * force;
          colors.setXYZ(i, 0.35 + force * 0.65, 0.95, 1);
          sizes.array[i] = layout.sizes[i] * (1.15 + force * 1.7);

          if (lineCount < 80 && force > 0.35) {
            const li = lineCount * 6;
            linePositions[li] = cursor.x;
            linePositions[li + 1] = cursor.y;
            linePositions[li + 2] = cursor.z;
            linePositions[li + 3] = x;
            linePositions[li + 4] = y;
            linePositions[li + 5] = z;
            lineCount += 1;
          }
        } else {
          colors.setXYZ(
            i,
            layout.colors[ix],
            layout.colors[ix + 1],
            layout.colors[ix + 2],
          );
          sizes.array[i] = layout.sizes[i];
        }
      }

      positions.setXYZ(i, x, y, z);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    sizes.needsUpdate = true;

    if (linesRef.current) {
      const linePos = linesRef.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      linePos.needsUpdate = true;
      linesRef.current.geometry.setDrawRange(0, lineCount * 2);
      const lineMat = linesRef.current.material as THREE.LineBasicMaterial;
      lineMat.opacity = hoverStrength * 0.55;
    }

    if (
      currentPhase === "boot" &&
      bootStart.current !== null &&
      !bootDone.current &&
      now - bootStart.current >= BOOT_MS
    ) {
      bootDone.current = true;
      queueMicrotask(onBootComplete);
    }

    if (currentPhase === "splash" && !splashDone.current && splashT >= 1) {
      splashDone.current = true;
      queueMicrotask(onSplashComplete);
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          uniforms={{
            uOpacity: { value: 1 },
            uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          }}
        />
      </points>

      <lineSegments ref={linesRef} geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial
          color="#5cecff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      <group ref={cursorRef} visible={false}>
        <mesh>
          <ringGeometry args={[0.34, 0.38, 64]} />
          <meshBasicMaterial color="#12c0e0" transparent opacity={0.8} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.18, 0.21, 48]} />
          <meshBasicMaterial color="#7af0ff" transparent opacity={0.9} />
        </mesh>
      </group>
    </>
  );
}

function CoreRings({ phase }: { phase: ExperiencePhase }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.25;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
    const hide = phase === "splash" ? 1 - Math.min(state.clock.elapsedTime, 1) : 1;
    group.current.visible = phase === "boot";
    group.current.scale.setScalar(phase === "boot" ? 1 : hide);
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[1.55, 0.006, 8, 160]} />
        <meshBasicMaterial color="#12c0e0" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
        <torusGeometry args={[2.15, 0.005, 8, 160]} />
        <meshBasicMaterial color="#7ad7ea" transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[0.6, Math.PI / 3, 0.2]}>
        <torusGeometry args={[2.8, 0.004, 8, 160]} />
        <meshBasicMaterial color="#9ae7f5" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Shockwave({ phase }: { phase: ExperiencePhase }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const start = useRef(0);

  useEffect(() => {
    if (phase === "splash") start.current = performance.now();
  }, [phase]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (phase !== "splash") {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    const t = Math.min(1, (performance.now() - start.current) / 1200);
    const scale = 0.2 + t * 18;
    mesh.scale.set(scale, scale, scale);
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - t) * 0.45;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]} visible={false}>
      <ringGeometry args={[0.45, 0.52, 80]} />
      <meshBasicMaterial color="#7af0ff" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function ParticleLoader() {
  const { phase, beginSplash, beginConsole } = useExperience();

  return (
    <div
      className={`particle-stage${phase === "console" ? " is-done" : ""}`}
      aria-hidden={phase === "console"}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.2], fov: 48, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ParticleSystem
          phase={phase}
          onBootComplete={beginSplash}
          onSplashComplete={beginConsole}
        />
        <CoreRings phase={phase} />
        <Shockwave phase={phase} />
      </Canvas>
    </div>
  );
}
