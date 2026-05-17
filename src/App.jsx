import { useEffect, useMemo, useState } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import './index.css'

const STORAGE_KEYS = {
  members: 'sanskar-vatika-members',
  notices: 'sanskar-vatika-notices',
  admin: 'sanskar-vatika-admin',
}

const SOCIETY_PAYMENT = {
  upiId: 'sanskarvatika@upi',
  payeeName: 'Sanskar Vatika Society',
}

const seedMembers = [
  { id: 1, name: 'Rohit Sharma', houseNumber: 'A-101', mobileNumber: '9876543210', whatsappNumber: '9876543210' },
  { id: 2, name: 'Pooja Verma', houseNumber: 'B-204', mobileNumber: '9988776655', whatsappNumber: '9988776655' },
  { id: 3, name: 'Mahesh Patel', houseNumber: 'C-315', mobileNumber: '9123456780', whatsappNumber: '9123456780' },
]

const galleryItems = [
  { title: 'Main Entrance', caption: 'Secure arrival with a welcoming community entrance.', image: '/gallery-gate.svg' },
  { title: 'Central Garden', caption: 'Green open space for walks, play, and relaxation.', image: '/gallery-garden.svg' },
  { title: 'Community Hall', caption: 'Shared venue for meetings, events, and celebrations.', image: '/gallery-hall.svg' },
  { title: 'Temple Corner', caption: 'A peaceful spiritual space within the society.', image: '/gallery-temple.svg' },
  { title: 'Festive Evenings', caption: 'Moments that bring residents together.', image: '/gallery-festival.svg' },
  { title: 'Evening View', caption: 'Well-lit surroundings for a calm residential feel.', image: '/gallery-evening.svg' },
]

const societyHighlights = [
  {
    title: 'Resident Updates',
    text: 'Important announcements and reminders can be managed from one place.',
  },
  {
    title: 'Member Directory',
    text: 'Store house-wise resident details in a simple and organized format.',
  },
  {
    title: 'Payment Notices',
    text: 'Enter an amount and generate a payment-ready notice for WhatsApp.',
  },
]

const howItWorks = [
  {
    title: 'Join The Community',
    text: 'Create a polished first impression for residents and visitors with a clear public homepage.',
  },
  {
    title: 'Manage Member Details',
    text: 'Store names, house numbers, mobile numbers, and WhatsApp numbers in the admin dashboard.',
  },
  {
    title: 'Send Targeted Notices',
    text: 'Prepare a notice for a selected house number with amount, message, and optional image.',
  },
  {
    title: 'Share And Collect',
    text: 'Send the notice directly from the dashboard and keep payment details attached to the record.',
  },
]

const defaultNoticeDraft = {
  title: '',
  houseNumber: '',
  message: '',
  amount: '',
  imageName: '',
  imageDataUrl: '',
}

function usePersistentState(key, fallbackValue) {
  const [value, setValue] = useState(() => {
    const saved = window.localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
    return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

function createPaymentLink({ houseNumber, amount, title }) {
  const params = new URLSearchParams({
    pa: SOCIETY_PAYMENT.upiId,
    pn: SOCIETY_PAYMENT.payeeName,
    am: amount,
    cu: 'INR',
    tn: `${title} - ${houseNumber}`,
  })

  return `upi://pay?${params.toString()}`
}

function buildWhatsAppMessage(member, notice) {
  const lines = [
    `Namaste ${member.name},`,
    '',
    `Society Notice: ${notice.title}`,
    notice.message,
    '',
    `House Number: ${member.houseNumber}`,
  ]

  if (notice.amount) {
    lines.push(`Amount Due: Rs. ${notice.amount}`)
  }

  if (notice.paymentLink) {
    lines.push(`Payment Link: ${notice.paymentLink}`)
  }

  if (notice.imageName) {
    lines.push(`Image Reference: ${notice.imageName}`)
    lines.push('Attach the selected notice image before final sending if needed.')
  }

  return encodeURIComponent(lines.join('\n'))
}

function buildWhatsAppUrl(member, notice) {
  const digitsOnly = member.whatsappNumber.replace(/\D/g, '')
  const phoneNumber = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly
  const message = buildWhatsAppMessage(member, notice)

  return `https://wa.me/${phoneNumber}?text=${message}`
}

function App() {
  const [members, setMembers] = usePersistentState(STORAGE_KEYS.members, seedMembers)
  const [notices, setNotices] = usePersistentState(STORAGE_KEYS.notices, [])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = usePersistentState(STORAGE_KEYS.admin, false)

  const stats = useMemo(() => {
    const houseCount = new Set(members.map((member) => member.houseNumber)).size

    return [
      { label: 'Residents', value: members.length },
      { label: 'Houses', value: houseCount },
      { label: 'Notices Sent', value: notices.length },
    ]
  }, [members, notices.length])

  return (
    <HashRouter>
      <div className="app-shell">
        <header className="site-header">
          <NavLink className="brand-mark" to="/">
            Sanskar Vatika
          </NavLink>
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage stats={stats} members={members} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                members={members}
                notices={notices}
                setMembers={setMembers}
                setNotices={setNotices}
                isAdminLoggedIn={isAdminLoggedIn}
                setIsAdminLoggedIn={setIsAdminLoggedIn}
              />
            }
          />
        </Routes>

        <footer className="site-footer">
          <p>Responsive society portal for desktop and mobile use.</p>
        </footer>
      </div>
    </HashRouter>
  )
}

function HomePage({ stats, members }) {
  return (
    <main className="page">
      <section className="clean-hero">
        <div className="clean-hero-copy">
          <span className="section-kicker">Residential Society Portal</span>
          <h1>Simple, clean communication for every home.</h1>
          <p>
            Manage residents, send house-wise WhatsApp notices, and generate payment-ready messages from
            one easy admin dashboard.
          </p>
          <div className="button-row">
            <a className="button primary" href="#/admin">
              Open Admin
            </a>
            <a className="button secondary" href="#/gallery">
              View Gallery
            </a>
          </div>
        </div>
        <div className="stats-grid">
          {stats.map((item) => (
            <article className="stat-box" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card-grid three-column compact-grid">
        {societyHighlights.map((item) => (
          <article className="content-card highlight-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="intro-section">
        <span className="section-kicker">How It Works</span>
        <h2>Built to keep society management straightforward.</h2>
        <p>
          The website gives your society a clean public presence and a practical admin panel for everyday
          communication.
        </p>
      </section>

      <section className="card-grid four-column">
        {howItWorks.map((item, index) => (
          <article className="content-card process-card" key={item.title}>
            <div className="process-icon">{index + 1}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="content-card">
        <div className="section-head">
          <div>
            <span className="section-kicker">Sample Residents</span>
            <h2>Preview of society member details</h2>
          </div>
        </div>
        <div className="member-grid">
          {members.slice(0, 3).map((member) => (
            <article className="member-tile" key={member.id}>
              <h3>{member.name}</h3>
              <p>{member.houseNumber}</p>
              <span>Mobile: {member.mobileNumber}</span>
              <span>WhatsApp: {member.whatsappNumber}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function AboutPage() {
  return (
    <main className="page">
      <section className="split-card">
        <div>
          <span className="section-kicker">About</span>
          <h2>A practical website for society communication.</h2>
        </div>
        <div className="stack-text">
          <p>
            This website is designed for a residential society that wants a clean online presence and a
            simple admin workflow.
          </p>
          <p>
            The public pages help introduce the society, while the admin page supports resident record
            management and WhatsApp-ready notice sending with payment amount handling.
          </p>
        </div>
      </section>

      <section className="card-grid three-column">
        <article className="content-card">
          <h3>Better communication</h3>
          <p>Committee members can prepare targeted notices for a specific house number.</p>
        </article>
        <article className="content-card">
          <h3>Simple administration</h3>
          <p>Resident records are managed directly from the dashboard with add, edit, and delete actions.</p>
        </article>
        <article className="content-card">
          <h3>Ready for future upgrade</h3>
          <p>You can later connect this frontend to a real database and secure backend services.</p>
        </article>
      </section>
    </main>
  )
}

function GalleryPage() {
  return (
    <main className="page">
      <section className="section-head">
        <div>
          <span className="section-kicker">Gallery</span>
          <h2>Community spaces and society moments</h2>
        </div>
      </section>
      <section className="gallery-grid">
        {galleryItems.map((item) => (
          <article className="gallery-item" key={item.title}>
            <img src={item.image} alt={item.title} />
            <div className="gallery-body">
              <h3>{item.title}</h3>
              <p>{item.caption}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function AdminPage({ members, notices, setMembers, setNotices, isAdminLoggedIn, setIsAdminLoggedIn }) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [sendState, setSendState] = useState({ kind: '', message: '' })
  const [memberForm, setMemberForm] = useState({
    id: null,
    name: '',
    houseNumber: '',
    mobileNumber: '',
    whatsappNumber: '',
  })
  const [noticeForm, setNoticeForm] = useState(defaultNoticeDraft)

  function handleLoginSubmit(event) {
    event.preventDefault()

    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      setIsAdminLoggedIn(true)
      setLoginError('')
      return
    }

    setLoginError('Use username "admin" and password "admin123" for this demo.')
  }

  function handleMemberSubmit(event) {
    event.preventDefault()

    const payload = {
      id: memberForm.id ?? Date.now(),
      name: memberForm.name.trim(),
      houseNumber: memberForm.houseNumber.trim().toUpperCase(),
      mobileNumber: memberForm.mobileNumber.trim(),
      whatsappNumber: memberForm.whatsappNumber.trim(),
    }

    if (!payload.name || !payload.houseNumber || !payload.mobileNumber || !payload.whatsappNumber) {
      return
    }

    setMembers((currentMembers) => {
      const exists = currentMembers.some((member) => member.id === payload.id)
      if (exists) {
        return currentMembers.map((member) => (member.id === payload.id ? payload : member))
      }

      return [payload, ...currentMembers]
    })

    setMemberForm({
      id: null,
      name: '',
      houseNumber: '',
      mobileNumber: '',
      whatsappNumber: '',
    })
  }

  function handleMemberEdit(member) {
    setMemberForm(member)
  }

  function handleMemberDelete(id) {
    setMembers((currentMembers) => currentMembers.filter((member) => member.id !== id))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setNoticeForm((current) => ({
        ...current,
        imageName: file.name,
        imageDataUrl: String(reader.result),
      }))
    }
    reader.readAsDataURL(file)
  }

  function handleNoticeSubmit(event) {
    event.preventDefault()

    if (!noticeForm.title || !noticeForm.houseNumber || !noticeForm.message || !noticeForm.amount) {
      return
    }

    const targetMember = members.find((member) => member.houseNumber === noticeForm.houseNumber)
    if (!targetMember) {
      return
    }

    const paymentLink = createPaymentLink({
      houseNumber: noticeForm.houseNumber,
      amount: noticeForm.amount,
      title: noticeForm.title.trim(),
    })

    const whatsappNotice = {
      title: noticeForm.title.trim(),
      message: noticeForm.message.trim(),
      amount: noticeForm.amount,
      paymentLink,
      imageName: noticeForm.imageName,
    }
    const whatsappUrl = buildWhatsAppUrl(targetMember, whatsappNotice)

    const record = {
      id: Date.now(),
      title: whatsappNotice.title,
      houseNumber: noticeForm.houseNumber,
      message: whatsappNotice.message,
      amount: whatsappNotice.amount,
      paymentLink,
      imageName: whatsappNotice.imageName,
      imageDataUrl: noticeForm.imageDataUrl,
      recipientName: targetMember.name,
      whatsappNumber: targetMember.whatsappNumber,
      createdAt: new Date().toLocaleString(),
      status: 'opened-whatsapp',
      deliveryMode: 'whatsapp',
      previewMessage: decodeURIComponent(buildWhatsAppMessage(targetMember, whatsappNotice)),
    }

    setNotices((currentNotices) => [record, ...currentNotices])
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setSendState({
      kind: 'success',
      message: `WhatsApp opened for ${targetMember.name} at house ${targetMember.houseNumber}. Review and send the message there.`,
    })

    setNoticeForm(defaultNoticeDraft)
  }

  const sortedMembers = [...members].sort((left, right) => left.houseNumber.localeCompare(right.houseNumber))
  const generatedPaymentLink =
    noticeForm.amount && noticeForm.title && noticeForm.houseNumber
      ? createPaymentLink({
          houseNumber: noticeForm.houseNumber,
          amount: noticeForm.amount,
          title: noticeForm.title.trim(),
        })
      : ''

  if (!isAdminLoggedIn) {
    return (
      <main className="page narrow-page">
        <section className="login-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Admin Login</span>
              <h2>Sign in to manage members and notices</h2>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleLoginSubmit}>
            <label>
              Username
              <input
                type="text"
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="admin"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="admin123"
              />
            </label>
            {loginError ? <p className="error-text">{loginError}</p> : null}
            <button className="button primary full" type="submit">
              Login
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="section-head admin-topbar">
        <div>
          <span className="section-kicker">Admin Dashboard</span>
          <h2>Manage society records and send house-wise notices</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setIsAdminLoggedIn(false)}>
          Logout
        </button>
      </section>

      <section className="card-grid two-column">
        <article className="content-card">
          <h3>{memberForm.id ? 'Edit Member' : 'Add Member'}</h3>
          <form className="form-grid" onSubmit={handleMemberSubmit}>
            <label>
              Name
              <input
                type="text"
                value={memberForm.name}
                onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Resident name"
              />
            </label>
            <label>
              House Number
              <input
                type="text"
                value={memberForm.houseNumber}
                onChange={(event) => setMemberForm((current) => ({ ...current, houseNumber: event.target.value }))}
                placeholder="A-101"
              />
            </label>
            <label>
              Mobile Number
              <input
                type="tel"
                value={memberForm.mobileNumber}
                onChange={(event) => setMemberForm((current) => ({ ...current, mobileNumber: event.target.value }))}
                placeholder="10-digit mobile number"
              />
            </label>
            <label>
              WhatsApp Number
              <input
                type="tel"
                value={memberForm.whatsappNumber}
                onChange={(event) => setMemberForm((current) => ({ ...current, whatsappNumber: event.target.value }))}
                placeholder="10-digit WhatsApp number"
              />
            </label>
            <div className="button-row">
              <button className="button primary" type="submit">
                {memberForm.id ? 'Update Member' : 'Save Member'}
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() =>
                  setMemberForm({
                    id: null,
                    name: '',
                    houseNumber: '',
                    mobileNumber: '',
                    whatsappNumber: '',
                  })
                }
              >
                Reset
              </button>
            </div>
          </form>
        </article>

        <article className="content-card">
          <h3>Send Notice</h3>
          {sendState.message ? <div className={`status-banner ${sendState.kind}`}>{sendState.message}</div> : null}
          <form className="form-grid" onSubmit={handleNoticeSubmit}>
            <label>
              Notice Title
              <input
                type="text"
                value={noticeForm.title}
                onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Maintenance reminder"
              />
            </label>
            <label>
              Select House Number
              <select
                value={noticeForm.houseNumber}
                onChange={(event) => setNoticeForm((current) => ({ ...current, houseNumber: event.target.value }))}
              >
                <option value="">Choose house</option>
                {sortedMembers.map((member) => (
                  <option key={member.id} value={member.houseNumber}>
                    {member.houseNumber} - {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Notice Message
              <textarea
                rows="5"
                value={noticeForm.message}
                onChange={(event) => setNoticeForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Enter the notice message."
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="1"
                step="1"
                value={noticeForm.amount}
                onChange={(event) => setNoticeForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="500"
              />
            </label>
            <label>
              Attach Image
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            {generatedPaymentLink ? (
              <div className="full-width preview-box">
                <span className="preview-label">Generated Payment Link</span>
                <p>{generatedPaymentLink}</p>
              </div>
            ) : null}
            {noticeForm.imageDataUrl ? (
              <div className="full-width image-preview">
                <img src={noticeForm.imageDataUrl} alt={noticeForm.imageName || 'Notice preview'} />
                <p>{noticeForm.imageName}</p>
              </div>
            ) : null}
            <p className="hint-text full-width">
              The amount automatically creates a UPI payment link. Clicking send opens WhatsApp with the
              notice message ready to review and send.
            </p>
            <div className="button-row">
              <button className="button primary" type="submit">
                Send Notice
              </button>
              {noticeForm.imageDataUrl ? (
                <a className="button secondary" href={noticeForm.imageDataUrl} target="_blank" rel="noreferrer">
                  Open Image
                </a>
              ) : null}
            </div>
          </form>
        </article>
      </section>

      <section className="card-grid two-column">
        <article className="content-card">
          <div className="section-head compact-head">
            <div>
              <span className="section-kicker">Directory</span>
              <h3>Member List</h3>
            </div>
            <span className="meta-badge">{sortedMembers.length} members</span>
          </div>
          <div className="stack-list">
            {sortedMembers.map((member) => (
              <article className="list-item" key={member.id}>
                <div>
                  <h4>{member.name}</h4>
                  <p>{member.houseNumber}</p>
                  <span>Mobile: {member.mobileNumber}</span>
                  <span>WhatsApp: {member.whatsappNumber}</span>
                </div>
                <div className="button-row">
                  <button className="button secondary small" type="button" onClick={() => handleMemberEdit(member)}>
                    Edit
                  </button>
                  <button className="button danger small" type="button" onClick={() => handleMemberDelete(member.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-head compact-head">
            <div>
              <span className="section-kicker">History</span>
              <h3>Notice Records</h3>
            </div>
            <span className="meta-badge">{notices.length} notices</span>
          </div>
          <div className="stack-list">
            {notices.length ? (
              notices.map((notice) => (
                <article className="list-item" key={notice.id}>
                  <div>
                    <h4>{notice.title}</h4>
                    <p>
                      {notice.houseNumber} - {notice.recipientName}
                    </p>
                    <span>{notice.createdAt}</span>
                    <span>Amount: Rs. {notice.amount}</span>
                    <span>Status: {notice.status === 'sent-demo' ? 'Sent (Demo)' : notice.status}</span>
                    {notice.imageName ? <span>Image: {notice.imageName}</span> : null}
                  </div>
                </article>
              ))
            ) : (
              <article className="list-item empty-state">
                <p>No notices have been prepared yet.</p>
              </article>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
