import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/query'

const FORMAT_OPTIONS = ['Any', 'Structured data', 'Images', 'Videos']

const LICENSE_OPTIONS = [
  { value: 'any', label: "Doesn't matter to me" },
  { value: 'public_domain', label: "No restrictions - use it however you want" },
  { value: 'attribution', label: "Free to use, just credit the creator" },
  { value: 'share_alike', label: "Free to use, but anything you build with it must stay open too" },
  { value: 'non_commercial', label: "Not for commercial projects" },
]

function App() {
  const [mode, setMode] = useState('configure')
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('Any')
  const [license, setLicense] = useState('any')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)

  const handleSearch = () => {
    setQuery('')

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setResults(Array.isArray(data) ? data : [data])
      })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="center">
      <div className="spacer" />

      <div className="panel">
        <div className="mode-toggle">
          <button type="button" onClick={() => setMode('url')} disabled={mode === 'url'}>
            Paste URL
          </button>
          <button type="button" onClick={() => setMode('configure')} disabled={mode === 'configure'}>
            Describe your project
          </button>
        </div>

        <textarea
          rows={3}
          placeholder={mode === 'url' ? 'Paste a Kaggle dataset URL' : 'Describe your project'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {mode === 'configure' && (
          <div className="filters">
            <label className="field">
              <span>Data format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>License</span>
              <select value={license} onChange={(e) => setLicense(e.target.value)}>
                {LICENSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <button type="button" className="search-button" onClick={handleSearch}>
          Search datasets
        </button>
      </div>

      <div className="results">
        {results.length === 0 ? (
          <div className="results-empty">Your results will show up here</div>
        ) : (
          results.slice(0, 3).map((dataset, i) => (
            <div className="card" key={i}>
              <div className="card-main">
                <div className="card-title">{dataset.title}</div>
                <div className="card-meta">
                  <span>{dataset.file_type}</span>
                  <span>{dataset.license}</span>
                </div>
                <a href={dataset.url} target="_blank" rel="noreferrer">
                  View on Kaggle
                </a>
              </div>

              <button type="button" className="description-toggle" onClick={() => setSelected(dataset)}>
                Description
              </button>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="card-title">{selected.title}</div>
            <div className="card-description">{selected.description}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
