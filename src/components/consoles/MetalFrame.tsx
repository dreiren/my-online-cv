import { type ReactNode } from "react";

type MetalFrameProps = {
  children: ReactNode;
};

export default function MetalFrame({ children }: MetalFrameProps) {
  return (
    <div className="metal-frame">
      <span className="metal-frame__face metal-frame__face--back" />
      <span className="metal-frame__face metal-frame__face--left" />
      <span className="metal-frame__face metal-frame__face--right" />
      <span className="metal-frame__face metal-frame__face--top" />
      <span className="metal-frame__face metal-frame__face--bottom" />

      <div className="metal-frame__front">
        <span className="metal-frame__screw metal-frame__screw--tl" />
        <span className="metal-frame__screw metal-frame__screw--tr" />
        <span className="metal-frame__screw metal-frame__screw--bl" />
        <span className="metal-frame__screw metal-frame__screw--br" />
        <span className="metal-frame__plate metal-frame__plate--tl" />
        <span className="metal-frame__plate metal-frame__plate--tr" />
        <span className="metal-frame__plate metal-frame__plate--bl" />
        <span className="metal-frame__plate metal-frame__plate--br" />
        <div className="metal-frame__well">{children}</div>
      </div>
    </div>
  );
}
