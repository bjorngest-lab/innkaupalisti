import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const CAT_ORDER = ['Mjólkurvörur', 'Brauð', 'Kjöt', 'Grænmeti', 'Ávextir', 'Frosið', 'Sósur', 'Drykkir', 'Annað']

// Ikon (emoji) fyrir hvern flokk
const CAT_ICON = {
  'Mjólkurvörur': '🥛',
  'Brauð': '🍞',
  'Kjöt': '🥩',
  'Grænmeti': '🥦',
  'Ávextir': '🍎',
  'Frosið': '🧊',
  'Sósur': '🥫',
  'Drykkir': '☕',
  'Annað': '🛒',
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

  // Flýtivörur
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

  return (
    <div className="app">
      <h1>🛒 Innkaupalisti</h1>

      <div className="quick-row">
        <p className="section-label">Smelltu til að bæta á listann</p>
        <button className="settings-btn" onClick={() => setShowSettings(true)} aria-label="Stilla flýtival">⚙️</button>
      </div>
      <div className="quick-buttons">
        {favs.map((q) => (
          <button key={q.id} className="quick-btn" onClick={() => addItem(q.name, q.cat)}>
            {q.name}
          </button>
        ))}
      </div>

      <div className="add-row">
        <input
          type="text"
          placeholder="Eigin vara…"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom() }}
        />
        <select value={customCat} onChange={(e) => setCustomCat(e.target.value)}>
          {CAT_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="add-btn" onClick={handleAddCustom}>+</button>
      </div>

      {loading ? (
        <div className="loading">Hleð…</div>
      ) : items.length === 0 ? (
        <div className="empty">Listinn er tómur — bættu við vörum hér að ofan.</div>
      ) : (
        <>
          {cats.map((cat) => (
            <div key={cat} className="cat-section">
              <p className="cat-header"><span className="cat-icon">{CAT_ICON[cat] || '🛒'}</span>{cat}</p>
              {items.filter((i) => i.cat === cat).map((item) => (
                <div key={item.id} className="item-row">
                  <button
                    className={'check' + (item.done ? ' done' : '')}
                    onClick={() => toggleDone(item)}
                    aria-label={item.done ? 'Afmerkja' : 'Merkja sem komið'}
                  >
                    {item.done ? '✓' : ''}
                  </button>
                  <span className={'item-name' + (item.done ? ' done' : '')}>{item.name}</span>
                  <div className="qty-wrap">
                    <button className="qty-btn" onClick={() => changeQty(item, -1)} aria-label="Minnka">−</button>
                    <span className="qty-num">{item.qty}x</span>
                    <button className="qty-btn" onClick={() => changeQty(item, 1)} aria-label="Auka">+</button>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item)} aria-label="Eyða">🗑</button>
                </div>
              ))}
            </div>
          ))}
          {hasDone && (
            <button className="clear-done" onClick={clearDone}>Hreinsa það sem er hakkað við</button>
          )}
        </>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              Stilla flýtival
              <button className="modal-close" onClick={() => setShowSettings(false)} aria-label="Loka">×</button>
            </h2>

            <div className="add-row">
              <input
                type="text"
                placeholder="Ný flýtivara…"
                value={favName}
                onChange={(e) => setFavName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addFav() }}
              />
              <select value={favCat} onChange={(e) => setFavCat(e.target.value)}>
                {CAT_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="add-btn" onClick={addFav}>+</button>
            </div>

            {favs.map((f) => (
              <div key={f.id} className="fav-row">
                <span className="fav-name">{f.name}</span>
                <span className="fav-cat">{f.cat}</span>
                <button className="del-btn" onClick={() => removeFav(f)} aria-label="Eyða flýtivöru">🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
