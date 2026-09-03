import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Gauge,
  Route as RouteIcon,
  Star,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { useCountUp } from './StatCard'
import { TRAFFIC_COLORS } from '../data/mockData'

function congestionLevel(c) {
  if (c < 0.3) return 'low'
  if (c < 0.5) return 'moderate'
  if (c < 0.7) return 'heavy'
  return 'severe'
}

/* forwardRef so AnimatePresence's popLayout mode can measure this card. */
const RouteCard = forwardRef(function RouteCard({ route }, ref) {
  const distance = useCountUp(route.distanceKm)
  const eta = useCountUp(route.etaMin)
  const cong = useCountUp(route.congestion * 100)
  const score = useCountUp(route.score)

  const level = congestionLevel(route.congestion)

  const scoreColor =
    route.score >= 85
      ? 'var(--low)'
      : route.score >= 70
        ? 'var(--moderate)'
        : 'var(--heavy)'

  return (
    <motion.div
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        borderColor: 'rgba(16,185,129,.3)',
        overflow: 'hidden',
      }}
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
          width: '100%',
        }}
      >

        {/* TITLE */}

        <div
          className="card-title"
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flex: '1 1 auto',
            minWidth: 0,
            lineHeight: 1.3,
          }}
        >
          <RouteIcon
            size={13}
            style={{
              flexShrink: 0,
            }}
          />

          <span
            style={{
              whiteSpace: 'normal',
            }}
          >
            Recommended Route
          </span>
        </div>

        {/* BADGES */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 5,
            flex: '0 1 auto',
            minWidth: 0,
          }}
        >

          {route.recommended && (
            <span
              className="badge badge-green"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 1,
                fontSize: 10,
              }}
            >
              <Star size={9} />
              Recommended
            </span>
          )}

          {route.fastest && (
            <span
              className="badge badge-cyan"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: 10,
              }}
            >
              Fastest
            </span>
          )}

        </div>
      </div>

      {/* =====================================================
          ALGORITHM
          ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 4,
          minWidth: 0,
        }}
      >

        <span
          className="badge badge-quantum"
          style={{
            flexShrink: 0,
          }}
        >
          <Zap size={9} />
          {route.algorithm}
        </span>

        {route.via && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-faint)',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            via {route.via}
          </span>
        )}

      </div>

      {/* =====================================================
          METRICS
          ===================================================== */}

      <div className="route-metrics">

        <div className="metric">
          <b>{distance.toFixed(1)}</b>
          <span>km</span>
        </div>

        <div className="metric">
          <b
            style={{
              color: 'var(--text)',
            }}
          >
            {Math.round(eta)}
          </b>

          <span>min ETA</span>
        </div>


        <div className="metric">
          <b
            style={{
              color: TRAFFIC_COLORS[level],
            }}
          >
            {Math.round(cong)}%
          </b>

          <span>congestion</span>
        </div>

      </div>

      {/* =====================================================
          ROUTE SCORE
          ===================================================== */}

      <div
        className="row-between"
        style={{
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
          }}
        >
          Route score
        </span>

        <span
          className="mono"
          style={{
            fontSize: 12,
            color: scoreColor,
          }}
        >
          {Math.round(score)} / 100
        </span>
      </div>

      <div className="score-bar">

        <motion.div
          className="score-fill"
          style={{
            background: scoreColor,
          }}
          initial={{
            width: 0,
          }}
          animate={{
            width: `${route.score}%`,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

      </div>

      {/* =====================================================
          WHY THIS ROUTE?
          ===================================================== */}

      <div
        style={{
          marginTop: 12,
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--panel-hover)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            marginBottom: 6,
          }}
        >
          Why this route?
        </div>

        <ul
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 11.5,
            color: 'var(--text-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {route.timeSavedMin > 0 && (
            <li>
              Estimated <strong style={{ color: 'var(--low)' }}>{route.timeSavedMin} min faster</strong> than next alternative
            </li>
          )}
          <li>Lower congestion on major road corridors</li>
          <li>Avoids reported traffic bottlenecks & incidents</li>
          <li>No toll roads on this path</li>
        </ul>
      </div>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          marginTop: 12,
          paddingTop: 11,
          borderTop:
            '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-faint)',
        }}
      >

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            minWidth: 0,
          }}
        >

          <Clock
            size={11}
            style={{
              flexShrink: 0,
            }}
          />

          Arrives{' '}

          {new Date(
            Date.now() +
              route.etaMin * 60000
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}

        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >

          <Gauge size={11} />

          {(
            route.distanceKm /
            (route.etaMin / 60)
          ).toFixed(0)}{' '}
          km/h avg

        </span>

      </div>

    </motion.div>
  )
})

export default RouteCard