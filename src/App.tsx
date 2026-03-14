import { useMemo, useState } from 'react'
import './App.css'

type Lang = 'en' | 'de' | 'fr'
type Category = 'search' | 'archive' | 'company' | 'maps' | 'research' | 'news' | 'stats' | 'media' | 'patents' | 'datasets'

type SourceItem = {
  id: string
  name: string
  url: string
  category: Category
  tags: string[]
  desc: Record<Lang, string>
}

const ui = {
  en: {
    title: 'Siftear',
    subtitle: 'Structured OSINT source platform',
    pick: 'Choose language',
    search: 'Search sources, tags, categories...',
    favorites: 'Favorites',
    board: 'Research Board',
    notes: 'Local Notes',
    export: 'Export',
    all: 'All',
    clear: 'Clear',
    open: 'Open',
  },
  de: {
    title: 'Siftear',
    subtitle: 'Strukturierte OSINT-Quellenplattform',
    pick: 'Sprache wählen',
    search: 'Quellen, Tags, Kategorien durchsuchen...',
    favorites: 'Favoriten',
    board: 'Research Board',
    notes: 'Lokale Notizen',
    export: 'Export',
    all: 'Alle',
    clear: 'Leeren',
    open: 'Öffnen',
  },
  fr: {
    title: 'Siftear',
    subtitle: 'Plateforme structurée de sources OSINT',
    pick: 'Choisir la langue',
    search: 'Rechercher sources, tags, catégories...',
    favorites: 'Favoris',
    board: 'Research Board',
    notes: 'Notes locales',
    export: 'Exporter',
    all: 'Tous',
    clear: 'Effacer',
    open: 'Ouvrir',
  },
} as const

const sources: SourceItem[] = [
  { id: 'osintframework', name: 'OSINT Framework', url: 'https://osintframework.com/', category: 'search', tags: ['framework', 'discovery'], desc: { en: 'OSINT link map', de: 'OSINT-Linkstruktur', fr: 'Carte de liens OSINT' } },
  { id: 'google-adv', name: 'Google Advanced Search', url: 'https://www.google.com/advanced_search', category: 'search', tags: ['google', 'operators'], desc: { en: 'Advanced query UI', de: 'Erweiterte Suchmaske', fr: 'Recherche avancée' } },
  { id: 'wayback', name: 'Wayback Machine', url: 'https://web.archive.org/', category: 'archive', tags: ['archive', 'history'], desc: { en: 'Historical snapshots', de: 'Historische Snapshots', fr: 'Captures historiques' } },
  { id: 'opencorporates', name: 'OpenCorporates', url: 'https://opencorporates.com/', category: 'company', tags: ['companies', 'registry'], desc: { en: 'Company records', de: 'Unternehmensregister', fr: 'Registres d’entreprises' } },
  { id: 'icann', name: 'ICANN Lookup', url: 'https://lookup.icann.org/', category: 'company', tags: ['domain', 'whois'], desc: { en: 'Domain registration data', de: 'Domain-Registrierungsdaten', fr: 'Données d’enregistrement domaine' } },
  { id: 'osm', name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', category: 'maps', tags: ['maps', 'geo'], desc: { en: 'Global open map', de: 'Offene Weltkarte', fr: 'Carte ouverte mondiale' } },
  { id: 'wikidata', name: 'Wikidata', url: 'https://www.wikidata.org/', category: 'research', tags: ['knowledge', 'entity'], desc: { en: 'Structured knowledge base', de: 'Strukturierte Wissensdatenbank', fr: 'Base de connaissances structurée' } },
  { id: 'crossref', name: 'Crossref', url: 'https://search.crossref.org/', category: 'research', tags: ['papers', 'doi'], desc: { en: 'Research metadata search', de: 'Suche in Forschungsmetadaten', fr: 'Recherche métadonnées scientifiques' } },
  { id: 'openalex', name: 'OpenAlex', url: 'https://openalex.org/', category: 'research', tags: ['papers', 'authors'], desc: { en: 'Open scholarly graph', de: 'Offener Wissenschaftsgraph', fr: 'Graphe scientifique ouvert' } },
  { id: 'gdelt', name: 'GDELT', url: 'https://www.gdeltproject.org/', category: 'news', tags: ['events', 'news'], desc: { en: 'Global event database', de: 'Globale Ereignisdaten', fr: 'Base mondiale d’événements' } },
  { id: 'eurostat', name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', category: 'stats', tags: ['statistics', 'eu'], desc: { en: 'European statistics', de: 'Europäische Statistiken', fr: 'Statistiques européennes' } },
  { id: 'commons', name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/', category: 'media', tags: ['images', 'media'], desc: { en: 'Open media repository', de: 'Offenes Medienarchiv', fr: 'Répertoire média ouvert' } },
  { id: 'nasa', name: 'NASA Image & Video', url: 'https://images.nasa.gov/', category: 'media', tags: ['space', 'images'], desc: { en: 'NASA media archive', de: 'NASA-Medienarchiv', fr: 'Archive média NASA' } },
  { id: 'patents', name: 'Google Patents', url: 'https://patents.google.com/', category: 'patents', tags: ['patent', 'tech'], desc: { en: 'Patent search', de: 'Patentrecherche', fr: 'Recherche de brevets' } },
  { id: 'commoncrawl', name: 'Common Crawl', url: 'https://commoncrawl.org/', category: 'datasets', tags: ['web', 'dataset'], desc: { en: 'Open web crawl data', de: 'Offene Web-Crawl-Daten', fr: 'Données de crawl web ouvertes' } },
]

const categories: Category[] = ['search', 'archive', 'company', 'maps', 'research', 'news', 'stats', 'media', 'patents', 'datasets']

export default function App() {
  const [lang, setLang] = useState<Lang | null>(() => (localStorage.getItem('siftear_lang') as Lang) ?? null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [fav, setFav] = useState<string[]>(() => JSON.parse(localStorage.getItem('siftear_fav') ?? '[]'))
  const [board, setBoard] = useState<string[]>(() => JSON.parse(localStorage.getItem('siftear_board') ?? '[]'))
  const [notes, setNotes] = useState(() => localStorage.getItem('siftear_notes') ?? '')

  if (!lang) {
    return (
      <div className="picker">
        <h1>Siftear</h1>
        <p>{ui.en.pick} / {ui.de.pick} / {ui.fr.pick}</p>
        <div className="row">
          {(['en', 'de', 'fr'] as Lang[]).map((l) => (
            <button key={l} onClick={() => { localStorage.setItem('siftear_lang', l); setLang(l) }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
    )
  }

  const t = ui[lang]

  const filtered = useMemo(() =>
    sources.filter((s) => {
      const matchesCategory = category === 'all' || s.category === category
      const text = `${s.name} ${s.tags.join(' ')} ${s.desc[lang]}`.toLowerCase()
      const matchesQ = text.includes(query.toLowerCase())
      return matchesCategory && matchesQ
    }), [query, category, lang],
  )

  const toggle = (id: string, set: string[], saveKey: string, setter: (v: string[]) => void) => {
    const next = set.includes(id) ? set.filter((x) => x !== id) : [...set, id]
    setter(next)
    localStorage.setItem(saveKey, JSON.stringify(next))
  }

  const exportData = () => {
    const payload = {
      favorites: fav.map((id) => sources.find((s) => s.id === id)?.name ?? id),
      board: board.map((id) => sources.find((s) => s.id === id)?.name ?? id),
      notes,
      exportedAt: new Date().toISOString(),
      signature: 'Siftear — curated OSINT source platform',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'siftear-export.json'
    a.click()
  }

  return (
    <div className="shell">
      <header>
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <button onClick={exportData}>{t.export}</button>
      </header>

      <section className="controls">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} />
        <div className="chips">
          <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>{t.all}</button>
          {categories.map((c) => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
      </section>

      <main>
        <section className="list">
          {filtered.map((s) => (
            <article key={s.id}>
              <div>
                <h3>{s.name}</h3>
                <p>{s.desc[lang]}</p>
                <small>{s.tags.join(' · ')}</small>
              </div>
              <div className="actions">
                <a href={s.url} target="_blank" rel="noreferrer">{t.open}</a>
                <button onClick={() => toggle(s.id, fav, 'siftear_fav', setFav)}>★</button>
                <button onClick={() => toggle(s.id, board, 'siftear_board', setBoard)}>＋</button>
              </div>
            </article>
          ))}
        </section>

        <aside>
          <div className="panel">
            <h4>{t.favorites} ({fav.length})</h4>
            <ul>{fav.map((id) => <li key={id}>{sources.find((s) => s.id === id)?.name ?? id}</li>)}</ul>
          </div>
          <div className="panel">
            <h4>{t.board} ({board.length})</h4>
            <ul>{board.map((id) => <li key={id}>{sources.find((s) => s.id === id)?.name ?? id}</li>)}</ul>
          </div>
          <div className="panel">
            <h4>{t.notes}</h4>
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); localStorage.setItem('siftear_notes', e.target.value) }} />
            <button onClick={() => { setNotes(''); localStorage.removeItem('siftear_notes') }}>{t.clear}</button>
          </div>
        </aside>
      </main>
    </div>
  )
}
