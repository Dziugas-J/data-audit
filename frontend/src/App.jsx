import { useState } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPrompt(query)
      setQuery('')

      fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
    }
  }

  return (
    <div className="center">
      <input
        type="text"
        placeholder="Describe"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export default App
