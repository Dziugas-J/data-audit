import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8001/query'

const FORMAT_OPTIONS = ['Any', 'Structured data', 'Images', 'Videos']

const LICENSE_OPTIONS = [
  { value: 'any', label: "No preference" },
  { value: 'public_domain', label: "Public domain" },
  { value: 'attribution', label: "Attribution" },
  { value: 'share_alike', label: "Share-alike" },
  { value: 'non_commercial', label: "Non-commercial" },
]

const isValidKaggleUrl = (text) =>
  /^https?:\/\/(www\.)?kaggle\.com\/datasets\/[\w-]+\/[\w-]+/.test(text.trim())

function App() {
  const [mode, setMode] = useState('configure')
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('Any')
  const [license, setLicense] = useState('any')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [view, setView] = useState('search')
  const [saved, setSaved] = useState([])

  const handleSave = (dataset) => {
    setSaved((prev) => (prev.some((d) => d.url === dataset.url) ? prev : [...prev, dataset]))
  }

  const handleRemove = (url) => {
    setSaved((prev) => prev.filter((d) => d.url !== url))
  }

  const handleSearch = () => {
    if (mode === 'url' && !isValidKaggleUrl(query)) {
      setValidationError('Please paste a valid dataset URL.')
      return
    }
    setValidationError(null)

    setQuery('')
    setView('search')
    setIsLoading(true)

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, file_type: format, license_class: license }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setResults(data.results)
        setMessage(data.message)
      })
      .finally(() => setIsLoading(false))
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
          <button
            type="button"
            onClick={() => {
              setMode('url')
              setQuery('')
              setValidationError(null)
              setFormat('Any')
              setLicense('any')
            }}
            disabled={mode === 'url'}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('configure')
              setQuery('')
              setValidationError(null)
              setFormat('Any')
              setLicense('any')
            }}
            disabled={mode === 'configure'}
          >
            Describe
          </button>
        </div>

        <textarea
          rows={3}
          placeholder={mode === 'url' ? 'Paste a dataset URL' : 'Describe your project'}
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

        <button type="button" className="search-button" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <>
              Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </>
          ) : (
            'Search datasets'
          )}
        </button>

        {validationError && <div className="validation-error">{validationError}</div>}
      </div>

      <div className="results">
        <div className="view-toggle">
          <button type="button" onClick={() => setView('search')} disabled={view === 'search'}>
            Search results
          </button>
          <button type="button" onClick={() => setView('saved')} disabled={view === 'saved'}>
            Saved
          </button>
        </div>

        {view === 'search' && message && <div className="results-message">{message}</div>}

        <table className="results-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Format</th>
              <th>License</th>
              <th>Link</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {(view === 'search' ? results : saved).length === 0 ? (
              <tr>
                <td className="results-empty" colSpan={7}>
                  {view === 'search' ? 'Your searched datasets will appear here' : 'Your saved datasets will show up here'}
                </td>
              </tr>
            ) : (
              (view === 'search' ? results.slice(0, 3) : saved).map((dataset, i) => (
                <tr key={i}>
                  <td>{dataset.source}</td>
                  <td>{dataset.title}</td>
                  <td>{dataset.subtitle}</td>
                  <td>{dataset.file_type}</td>
                  <td>{dataset.license}</td>
                  <td>
                    <a href={dataset.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </td>
                  <td>
                    {view === 'search' ? (
                      <button type="button" className="save-button" onClick={() => handleSave(dataset)}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="save-button" onClick={() => handleRemove(dataset.url)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="spacer" />
    </div>
  )
}

export default App
