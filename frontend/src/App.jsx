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
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = () => {
    setQuery('')
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
          <button type="button" onClick={() => setMode('url')} disabled={mode === 'url'}>
            URL
          </button>
          <button type="button" onClick={() => setMode('configure')} disabled={mode === 'configure'}>
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
      </div>

      <div className="results">
        {message && <div className="results-message">{message}</div>}

        <table className="results-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Format</th>
              <th>License</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td className="results-empty" colSpan={5}>
                  Your results will show up here
                </td>
              </tr>
            ) : (
              results.slice(0, 3).map((dataset, i) => (
                <tr key={i}>
                  <td>{dataset.title}</td>
                  <td>{dataset.subtitle}</td>
                  <td>{dataset.file_type}</td>
                  <td>{dataset.license}</td>
                  <td>
                    <a href={dataset.url} target="_blank" rel="noreferrer">
                      View
                    </a>
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
