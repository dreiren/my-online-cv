"use client";

export default function DetailBlock() {
  return (
    <section className="hud-block hud-block--detail" aria-label="Profile details">
      <header className="hud-block__chrome">
        <span>02</span>
        <span>DATA.STREAM</span>
        <span>READY</span>
      </header>
      <div className="hud-block__body">
        <label className="hud-field">
          <span>NAME</span>
          <b />
        </label>
        <label className="hud-field">
          <span>ROLE</span>
          <b />
        </label>
        <label className="hud-field">
          <span>STATUS</span>
          <b className="is-live">ONLINE</b>
        </label>
        <div className="hud-notes">
          <span>DETAILS</span>
          <p>Awaiting profile data.</p>
        </div>
      </div>
    </section>
  );
}
