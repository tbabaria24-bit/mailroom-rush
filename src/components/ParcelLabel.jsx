import { HALLS, SIZES } from '../data/game'

// Pseudo-barcode built from the tracking number so each parcel looks unique.
function Barcode({ code }) {
  const bars = code.split('').flatMap((ch, i) => {
    const n = ch.charCodeAt(0) + i
    return [(n % 3) + 1, ((n >> 2) % 2) + 1]
  })
  return (
    <div className="barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} style={{ width: w * 2, background: i % 2 ? 'transparent' : 'currentColor' }} />
      ))}
    </div>
  )
}

export default function ParcelLabel({ parcel, showHall, feedback }) {
  const size = SIZES[parcel.size]
  const hall = parcel.resident && HALLS.find((h) => h.id === parcel.resident.hallId)
  const state = feedback ? `label--${feedback.type}` : ''

  return (
    <div className={`parcel parcel--${parcel.size}`}>
      <div key={parcel.key} className={`label ${state}`}>
        <div className="label__top">
          <span className="carrier">{parcel.carrier}</span>
          <span className="size-chip">
            {size.icon} {size.label}
          </span>
        </div>
        <div className="label__to">SHIP TO:</div>
        <div className="label__name">
          {parcel.recipient.last.toUpperCase()}, {parcel.recipient.first.toUpperCase()}
        </div>
        <div className="label__addr">
          {showHall && hall ? (
            <>
              {hall.name.toUpperCase()} · RM {parcel.resident.room}
            </>
          ) : (
            <>STUDENT HOUSING · TAMPA FL 33620</>
          )}
        </div>
        <Barcode code={parcel.tracking} />
        <div className="label__track">{parcel.tracking}</div>
      </div>
    </div>
  )
}
