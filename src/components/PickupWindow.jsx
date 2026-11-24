// A resident at the pickup window, waiting for a package you already shelved.
export default function PickupWindow({ pickup, patience }) {
  const pct = (pickup.left / patience) * 100
  const mood = pct > 60 ? '🙂' : pct > 30 ? '😐' : '😠'
  return (
    <section className="pickup" role="alert">
      <div className="pickup__face" aria-hidden="true">
        {mood}
      </div>
      <div className="pickup__body">
        <p className="pickup__say">
          “Hi! I&apos;m <strong>{pickup.name}</strong>. I got an email that a package came in for me?”
        </p>
        <p className="pickup__hint">Click the bin where you shelved it. They&apos;ll wait {pickup.left}s.</p>
        <div className="pickup__bar">
          <span style={{ width: `${pct}%` }} className={pct <= 30 ? 'low' : ''} />
        </div>
      </div>
    </section>
  )
}
