export type SpacePose = {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

export type CameraRig = {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
};

type Region = {
  x: readonly [number, number];
  y: readonly [number, number];
  z: readonly [number, number];
  rx: readonly [number, number];
  ry: readonly [number, number];
  rz: readonly [number, number];
};

const SPACE_REGIONS: Region[] = [
  {
    x: [-160, 200],
    y: [-80, 100],
    z: [-90, 140],
    rx: [-8, 8],
    ry: [-12, 12],
    rz: [-4, 4],
  },
  {
    x: [-1280, -700],
    y: [-520, -60],
    z: [-1760, -920],
    rx: [-18, 8],
    ry: [10, 30],
    rz: [-8, 5],
  },
  {
    x: [620, 1220],
    y: [80, 540],
    z: [780, 1620],
    rx: [-8, 18],
    ry: [-30, -8],
    rz: [-5, 8],
  },
];

function range(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function spaceScale() {
  if (window.innerWidth < 768) return 0.38;
  if (window.innerWidth < 1024) return 0.66;
  return 1;
}

export function generateSpacePoses(): SpacePose[] {
  const scale = spaceScale();

  return shuffle(SPACE_REGIONS).map((region) => ({
    x: range(region.x[0], region.x[1]) * scale,
    y: range(region.y[0], region.y[1]) * scale,
    z: range(region.z[0], region.z[1]) * scale,
    rotateX: range(region.rx[0], region.rx[1]),
    rotateY: range(region.ry[0], region.ry[1]),
    rotateZ: range(region.rz[0], region.rz[1]),
  }));
}

export function cameraForPose(pose: SpacePose): CameraRig {
  return {
    x: pose.x,
    y: pose.y,
    z: pose.z,
    pitch: pose.rotateX,
    yaw: pose.rotateY,
    roll: pose.rotateZ * 0.35,
  };
}

export function flightMidpoint(from: CameraRig, to: CameraRig): CameraRig {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return {
    x: (from.x + to.x) / 2 - dy * 0.28,
    y: (from.y + to.y) / 2 - Math.abs(dx) * 0.14 - 180,
    z: (from.z + to.z) / 2 - 620,
    pitch: (from.pitch + to.pitch) / 2 + 11,
    yaw: (from.yaw + to.yaw) / 2 + (dx > 0 ? -16 : 16),
    roll: (from.roll + to.roll) / 2 + (dx > 0 ? 8 : -8),
  };
}

export function introCamera(pose: SpacePose): CameraRig {
  return {
    x: pose.x + range(-240, 240),
    y: pose.y + range(-140, 140),
    z: pose.z - 1500,
    pitch: pose.rotateX + 14,
    yaw: pose.rotateY - 20,
    roll: range(-10, 10),
  };
}
