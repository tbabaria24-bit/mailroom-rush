import { HALLS, SHELVES } from '../data/game'

function Bin({ hall, shelf, count, flash, onSort }) {
  return (
    <button
      className={`bin ${flash ? `bin--${flash}` : ''}`}
      style={{ '--hall': hall.color }}
      onClick={() => onSort({ hallId: hall.id, shelfId: shelf.id })}
      aria-label={`${hall.name}, ${shelf.label}, ${count} parcels`}
    >
      <span className="bin__label">{shelf.label}</span>
      <span className="bin__hint">{shelf.hint}</span>
      <span className="bin__stack" aria-hidden="true">
        {Array.from({ length: Math.min(count, 8) }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </button>
  )
}

export default function MailroomWall({ counts, flash, onSort, hasDesk, pickupMode }) {
  const flashFor = (id) => (flash?.id === id ? `bin--${flash.type}` : '')
  return (
    <section className={`wall ${pickupMode ? 'wall--pickup' : ''}`}>
      <div className="wall__grid">
        {HALLS.map((hall) => (
          <div key={hall.id} className="wall__col">
            <h3 className="wall__hall" style={{ '--hall': hall.color }}>
              {hall.name}
            </h3>
            {SHELVES.map((shelf) => {
              const id = `${hall.id}-${shelf.id}`
              return (
                <Bin
                  key={id}
                  hall={hall}
                  shelf={shelf}
                  count={counts[id] || 0}
                  flash={flash?.id === id ? flash.type : null}
                  onSort={onSort}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className={`wall__extra ${hasDesk ? 'wall__extra--two' : ''}`}>
        {hasDesk && (
          <button className={`desk ${flashFor('desk')}`} onClick={() => onSort('desk')}>
            ✍️ Desk Hold <span className="muted">— signature required</span>
            {counts.desk > 0 && <span className="desk__count">{counts.desk}</span>}
          </button>
        )}
        <button className={`rts ${flashFor('rts')}`} onClick={() => onSort('rts')} disabled={pickupMode}>
          ↩ Return to sender <span className="muted">— no resident by that name</span>
        </button>
      </div>
    </section>
  )
}
