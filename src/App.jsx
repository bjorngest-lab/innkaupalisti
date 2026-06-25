import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const CAT_ORDER = ['Mjólkurvörur', 'Brauð', 'Kjöt', 'Grænmeti', 'Ávextir', 'Frosið', 'Sósur', 'Drykkir', 'Annað']

// Flokkur -> litaklasi úr þemanu (.ikl-cat-*)
const CAT_DOT = {
  'Mjólkurvörur': 'ikl-cat-mjolk',
  'Brauð': 'ikl-cat-braud',
  'Kjöt': 'ikl-cat-kjot',
  'Grænmeti': 'ikl-cat-graenmeti',
  'Ávextir': 'ikl-cat-graenmeti',
  'Frosið': 'ikl-cat-thurr',
  'Sósur': 'ikl-cat-annad',
  'Drykkir': 'ikl-cat-annad',
  'Annað': 'ikl-cat-annad',
}

export default function App() {
  const [items, setItems] = useState([])
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)
  const [customName, setCustomName] = useState('')
  const [customCat, setCustomCat] = useState('Mjólkurvörur')
  const [showSettings, setShowSettings] = useState(false)
  const [favName, setFavName] = useState('')
  const [favCat, setFavCat] = useState('Mjólkurvörur')

  useEffect(() => {
    loadAll()
    const channel = supabase
      .channel('innkaup-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innkaupalisti' }, () => loadItems())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flytivorur' }, () => loadFavs())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadAll() {
    await Promise.all([loadItems(), loadFavs()])
    setLoading(false)
  }

  async function loadItems() {
    const { data } = await supabase.from('innkaupalisti').select('*').order('created_at', { ascending: true })
    setItems(data || [])
  }

  async function loadFavs() {
    const { data } = await supabase.from('flytivorur').select('*').order('created_at', { ascending: true })
    setFavs(data || [])
  }

  async function addItem(name, cat) {
    const existing = items.find((i) => i.name.toLowerCase() === name.toLowerCase() && !i.done)
    if (existing) {
      await supabase.from('innkaupalisti').update({ qty: existing.qty + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('innkaupalisti').insert({ name, cat: cat || 'Annað', qty: 1, done: false })
    }
    loadItems()
  }

  async function changeQty(item, delta) {
    const newQty = item.qty + delta
    if (newQty < 1) {
      await supabase.from('innkaupalisti').delete().eq('id', item.id)
    } else {
      await supabase.from('innkaupalisti').update({ qty: newQty }).eq('id', item.id)
    }
    loadItems()
  }

  async function toggleDone(item) {
    await supabase.from('innkaupalisti').update({ done: !item.done }).eq('id', item.id)
    loadItems()
  }

  async function removeItem(item) {
    await supabase.from('innkaupalisti').delete().eq('id', item.id)
    loadItems()
  }

  async function clearDone() {
    await supabase.from('innkaupalisti').delete().eq('done', true)
    loadItems()
  }

  function handleAddCustom() {
    const name = customName.trim()
    if (name) { addItem(name, customCat); setCustomName('') }
  }

  async function addFav() {
    const name = favName.trim()
    if (!name) return
    await supabase.from('flytivorur').insert({ name, cat: favCat })
    setFavName('')
    loadFavs()
  }

  async function removeFav(fav) {
    await supabase.from('flytivorur').delete().eq('id', fav.id)
    loadFavs()
  }

  const cats = CAT_ORDER.filter((c) => items.some((i) => i.cat === c))
  const hasDone = items.some((i) => i.done)
  const doneCount = items.filter((i) => i.done).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="ikl-page">
      <div className="ikl-app">

        <div className="ikl-header">
          <div className="ikl-eyebrow">Innkaupalisti</div>
          <h1 className="ikl-title">Í körfuna</h1>

          <div className="ikl-summary">
            <div>
              <div className="ikl-summary-label">Komið í körfu</div>
              <div className="ikl-summary-count">{doneCount} af {totalCount}</div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{ border: 'none', background: 'none', color: 'var(--ikl-text-muted)', fontSize: '22px', cursor: 'pointer' }}
              aria-label="Stilla flýtival"
            >⚙</button>
          </div>

          <div className="ikl-progress">
            <div className="ikl-progress-fill" style={{ width: progress + '%' }}></div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 24px' }}>
          {loading ? (
            <div className="ikl-done-state">Hleð…</div>
          ) : items.length === 0 ? (
            <div className="ikl-done-state">
              <div className="ikl-done-title">Listinn er tómur</div>
              Bættu við vörum hér að neðan.
            </div>
          ) : (
            <>
              {cats.map((cat) => {
                const catItems = items.filter((i) => i.cat === cat)
                return (
                  <div key={cat} className="ikl-section">
                    <div className="ikl-section-head">
                      <span className={'ikl-section-dot ' + (CAT_DOT[cat] || 'ikl-cat-annad')}></span>
                      <span className="ikl-section-name">{cat}</span>
                      <span className="ikl-section-count">{catItems.length}</span>
                    </div>
                    {catItems.map((item) => (
                      <div key={item.id} className={'ikl-item' + (item.done ? ' is-done' : '')}>
                        <button
                          className={'ikl-check' + (item.done ? ' is-done' : '')}
                          onClick={() => toggleDone(item)}
                          aria-label={item.done ? 'Afmerkja' : 'Merkja sem komið'}
                        ></button>
                        <div className="ikl-item-body">
                          <div className="ikl-item-name">{item.name}</div>
                          {item.qty > 1 && <div className="ikl-item-qty">{item.qty} stk</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => changeQty(item, -1)} aria-label="Minnka"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--ikl-border-strong)', background: '#fff', fontSize: '18px', cursor: 'pointer', color: 'var(--ikl-text-soft)' }}>−</button>
                          <span className="ikl-item-qty" style={{ minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => changeQty(item, 1)} aria-label="Auka"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--ikl-border-strong)', background: '#fff', fontSize: '18px', cursor: 'pointer', color: 'var(--ikl-text-soft)' }}>+</button>
                        </div>
                        <button className="ikl-remove" onClick={() => removeItem(item)} aria-label="Eyða">×</button>
                      </div>
                    ))}
                  </div>
                )
              })}
              {hasDone && (
                <button onClick={clearDone}
                  style={{ display: 'block', margin: '22px auto 8px', background: 'none', border: '1px solid var(--ikl-border-strong)', borderRadius: '12px', padding: '10px 18px', fontSize: '14px', color: 'var(--ikl-text-soft)', cursor: 'pointer', fontFamily: 'var(--ikl-font)' }}>
                  Hreinsa það sem er komið
                </button>
              )}
            </>
          )}
        </div>

        <div className="ikl-addbar">
          <div className="ikl-chips">
            {favs.map((q) => (
              <button key={q.id} className="ikl-chip" onClick={() => addItem(q.name, q.cat)}>
                {q.name}
              </button>
            ))}
          </div>
          <div className="ikl-addrow">
            <input
              className="ikl-input"
              type="text"
              placeholder="Bæta við vöru…"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom() }}
            />
            <select
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              className="ikl-input"
              style={{ flex: 'none', width: '120px' }}
            >
              {CAT_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="ikl-add-btn" onClick={handleAddCustom}>+</button>
          </div>
        </div>

      </div>

      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--ikl-surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '440px', maxHeight: '80vh', overflowY: 'auto', padding: '24px 24px 32px', fontFamily: 'var(--ikl-font)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>Stilla flýtival</span>
              <button onClick={() => setShowSettings(false)} aria-label="Loka"
                style={{ border: 'none', background: 'none', fontSize: '26px', color: 'var(--ikl-text-muted)', cursor: 'pointer' }}>×</button>
            </div>

            <div className="ikl-addrow" style={{ marginBottom: '18px' }}>
              <input
                className="ikl-input"
                type="text"
                placeholder="Ný flýtivara…"
                value={favName}
                onChange={(e) => setFavName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addFav() }}
              />
              <select
                value={favCat}
                onChange={(e) => setFavCat(e.target.value)}
                className="ikl-input"
                style={{ flex: 'none', width: '120px' }}
              >
                {CAT_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="ikl-add-btn" onClick={addFav}>+</button>
            </div>

            {favs.map((f) => (
              <div key={f.id} className="ikl-item">
                <span className={'ikl-section-dot ' + (CAT_DOT[f.cat] || 'ikl-cat-annad')}></span>
                <div className="ikl-item-body">
                  <div className="ikl-item-name">{f.name}</div>
                  <div className="ikl-item-qty">{f.cat}</div>
                </div>
                <button className="ikl-remove" onClick={() => removeFav(f)} aria-label="Eyða flýtivöru">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
