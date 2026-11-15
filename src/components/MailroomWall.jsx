import { HALLS, SHELVES } from '../data/game'

function Bin({ hall, shelf, count, flash, onSort }) {
  return (
    <button
      className={`bin ${flash ? `bin--${flash}` : ''}`}
      style={{ '--hall': hall.color }}
      onClick={() => onSort({ hallId: hall.id, shelfId: shelf.id })}
      aria-label={`${hall.name}, ${shelf.label}`}
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

export default function MailroomWall({ counts, flash, onSort }) {
  return (
    <section className="wall">
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
      <button
        className={`rts ${flash?.id === 'rts' ? `bin--${flash.type}` : ''}`}
        onClick={() => onSort('rts')}
      >
        ↩ Return to sender <span className="muted">— no resident by that name</span>
      </button>
    </section>
  )
}
