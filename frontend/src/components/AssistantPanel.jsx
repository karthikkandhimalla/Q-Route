import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import * as api from '../services/api'
import { Robot } from './AnimatedAuthForm'

const suggestions = [
  'Find a route from HITEC City to Charminar',
  'Can you find another way?',
  'Why is this route better?',
]

export default function AssistantPanel() {
  const { start, end, selectedRoute, routes, segments, incidents, applyAssistantActions } = useApp()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  async function submit(text = draft) {
    const content = text.trim()
    if (!content || busy) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setDraft('')
    setError(null)
    setBusy(true)
    try {
      const response = await api.assistantChat({
        messages: nextMessages,
        context: {
          start,
          destination: end,
          selected_route: selectedRoute,
          current_route: selectedRoute,
          routes,
          traffic: { segments, incidents },
        },
      })
      applyAssistantActions(response.actions)
      setMessages([...nextMessages, { role: 'assistant', content: response.message }])
    } catch (err) {
      setError(err.message || 'The assistant is unavailable.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="assistant-float">
      <AnimatePresence>
        {open && (
          <motion.section
            className="assistant-panel"
            aria-label="AI route assistant"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="assistant-heading">
              <div className="assistant-title"><MessageCircle size={14} /><span>Q Route AI</span></div>
              <span className="assistant-status"><Sparkles size={11} /> AI</span>
              <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Close Q Route AI" title="Close"><X size={15} /></button>
            </div>

            <div className="assistant-thread" aria-live="polite">
              {!messages.length && (
                <div className="assistant-empty">
                  <strong>Ask anything about your route.</strong>
                  <span>I can understand locations, preferences, traffic, alternatives, and the route currently on your map.</span>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>
                  {message.content}
                </div>
              ))}
              {busy && <div className="assistant-message assistant"><Loader2 size={13} className="spin" /> Checking the live route data...</div>}
            </div>

            {!messages.length && (
              <div className="assistant-suggestions">
                {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => submit(suggestion)}>{suggestion}</button>)}
              </div>
            )}

            {error && <p className="assistant-error">{error}</p>}
            <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); submit() }}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything about your route..." aria-label="Ask anything about your route" disabled={busy} />
              <button className="icon-btn" type="submit" aria-label="Send message" title="Send message" disabled={busy || !draft.trim()}><Send size={15} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        className="assistant-float-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Ask Q Route AI"
        aria-expanded={open}
        title="Ask Q Route AI"
      >
        <span className="assistant-pulse" aria-hidden="true" />
        <Robot turned={false} />
      </button>
    </div>
  )
}
