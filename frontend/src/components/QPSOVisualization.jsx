import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

const PIPELINE_STEPS = [
  { id: 1, label: 'Candidate routes', detail: 'Extract graph corridors' },
  { id: 2, label: 'Traffic evaluation', detail: 'Apply segment speeds' },
  { id: 3, label: 'Fitness calculation', detail: 'Evaluate objective function' },
  { id: 4, label: 'Optimization', detail: 'Quantum delta-potential search' },
  { id: 5, label: 'Best route', detail: 'Select global minimum' },
]

export default function QPSOVisualization({ active = false, iterations = 48, bestFitness = 0.418 }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ margin: 0 }}>
          <Cpu size={14} />
          <span>QPSO Optimization</span>
        </div>
        <span className="badge badge-green" style={{ padding: '2px 8px', fontSize: 10 }}>
          Technical Metaheuristic
        </span>
      </div>

      {/* COMPACT PROCESS PIPELINE */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 8,
          }}
        >
          Optimization Pipeline
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 5,
            textAlign: 'center',
          }}
        >
          {PIPELINE_STEPS.map((s) => (
            <div
              key={s.id}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'var(--brand-light)' : 'var(--panel-hover)',
                border: active && s.id === 4 ? '1px solid var(--brand)' : '1px solid var(--border)',
                fontSize: 10,
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 9.5 }}>Step {s.id}</div>
              <div
                style={{
                  fontWeight: 600,
                  color: 'var(--text)',
                  fontSize: 10.5,
                  marginTop: 3,
                  lineHeight: 1.25,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXECUTION METRICS */}
      <div className="qpso-stats" style={{ marginBottom: 10 }}>
        <div className="qpso-stat">
          <b className="mono">12</b>
          <span>Candidates</span>
        </div>
        <div className="qpso-stat">
          <b className="mono">{iterations}</b>
          <span>Iterations</span>
        </div>
        <div className="qpso-stat">
          <b className="mono" style={{ color: 'var(--low)' }}>{bestFitness.toFixed(3)}</b>
          <span>Fitness</span>
        </div>
        <div className="qpso-stat">
          <b className="mono">16.2 ms</b>
          <span>Runtime</span>
        </div>
      </div>

      {/* EXPLANATION SECTION */}
      <button
        className="btn btn-sm btn-block"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--panel-hover)',
          border: '1px solid var(--border)',
          fontSize: 11.5,
          color: 'var(--text-dim)',
          marginTop: 8,
        }}
      >
        <span>How QPSO selects this route</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--panel-hover)',
                border: '1px solid var(--border)',
                fontSize: 11.5,
                lineHeight: 1.55,
                color: 'var(--text-dim)',
              }}
            >
              <p style={{ marginBottom: 6 }}>
                <strong>Quantum Particle Swarm Optimization (QPSO)</strong> models route options through probabilistic wave-function states rather than classical Newtonian velocity vectors, overcoming premature convergence in dense urban road networks.
              </p>
              <p style={{ margin: 0 }}>
                The algorithm minimizes a multi-objective cost function balancing travel time, real-time segment congestion, and network junction delays.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
