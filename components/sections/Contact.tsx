'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { CONTACT } from '@/lib/constants'
import CornerTrace from '@/components/ui/CornerTrace'

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-dm-mono)',
  fontSize: 11,
  color: '#444',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#111111',
  border: '1px solid #1A1A1A',
  borderRadius: 2,
  padding: '12px 16px',
  color: '#F0EDE6',
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 0.2s',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function FocusInput({ type = 'text', name, required, placeholder }: { type?: string; name: string; required?: boolean; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: focused ? '#38BDF8' : '#1A1A1A' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function FocusSelect({ name, required }: { name: string; required?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      name={name}
      required={required}
      style={{
        ...inputStyle,
        borderColor: focused ? '#38BDF8' : '#1A1A1A',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23666' strokeWidth='1.5' strokeLinecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
        paddingRight: 40,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <option value="">Select a service</option>
      <option value="Brand Website">Brand Website</option>
      <option value="AI Dashboard">AI Dashboard</option>
      <option value="Automation Pipeline">Automation Pipeline</option>
      <option value="Other">Other</option>
    </select>
  )
}

function FocusTextarea({ name, rows, required, placeholder }: { name: string; rows?: number; required?: boolean; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      name={name}
      rows={rows ?? 4}
      required={required}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: 'vertical', minHeight: 120, borderColor: focused ? '#38BDF8' : '#1A1A1A' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export default function Contact() {
  const shouldReduce = useReducedMotion() ?? false
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setLoading(true)
    setError('')
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '',
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? ''
      )
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please email us at admin@relentlessais.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="contact"
      style={{ backgroundColor: '#080808', padding: 'clamp(80px, 10vw, 120px) 24px' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 64,
          alignItems: 'start',
        }}>
          {/* Left: copy + info */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: '#38BDF8', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>
              Get in Touch
            </p>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EDE6', lineHeight: 1.15, marginBottom: 20 }}>
              Let&apos;s build<br />something.
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 18, color: '#666', lineHeight: 1.7, marginBottom: 40 }}>
              Whether you need a brand website, a data dashboard, or a custom automation pipeline — tell us what you&apos;re working on and we&apos;ll get back to you within 24 hours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '✉', text: CONTACT.email },
                { icon: '☎', text: CONTACT.phone },
                { icon: '◎', text: CONTACT.location },
              ].map(({ icon, text }) => (
                <p key={text} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 13, color: '#444', display: 'flex', gap: 12 }}>
                  <span style={{ color: '#38BDF8' }}>{icon}</span>
                  {text}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ position: 'relative' }}
          >
            {/* CornerTrace on form wrapper */}
            <CornerTrace duration={4} width={560} height={480} showBrackets={false} />

            <div style={{ padding: 2 }}>
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: 40, textAlign: 'center' }}
                  >
                    <p style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 700, color: '#F0EDE6' }}>
                      We&apos;ll be in touch shortly.
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 13, color: '#444', marginTop: 12 }}>
                      Expect a response within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                  >
                    <Field label="Name">
                      <FocusInput name="from_name" required placeholder="Your name" />
                    </Field>
                    <Field label="Email">
                      <FocusInput type="email" name="from_email" required placeholder="your@email.com" />
                    </Field>
                    <Field label="Service">
                      <FocusSelect name="service" required />
                    </Field>
                    <Field label="Message">
                      <FocusTextarea name="message" rows={4} required placeholder="Tell us about your project..." />
                    </Field>

                    {error && (
                      <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 12, color: '#ef4444' }}>{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        backgroundColor: '#38BDF8',
                        color: '#080808',
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: 15,
                        fontWeight: 500,
                        padding: '14px 24px',
                        borderRadius: 2,
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'none',
                        opacity: loading ? 0.7 : 1,
                        transition: 'filter 0.2s, transform 0.2s',
                      }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'scale(1.01)' } }}
                      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
                    >
                      {loading ? 'Sending...' : 'Send Enquiry →'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
