"use client";

export default function ImageBlock() {
  return (
    <section className="hud-block hud-block--image" aria-label="Profile image">
      <header className="hud-block__chrome">
        <span>01</span>
        <span>VISUAL.FEED</span>
        <span>SCAN</span>
      </header>
      <div className="hud-block__frame">
        <div className="hud-block__scan" />
        <div className="hud-block__crosshair" />
        <p className="hud-block__standby">IMG.SRC // STANDBY</p>
      </div>
    </section>
  );
}
