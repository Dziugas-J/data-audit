import { useState } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPrompt(query)
      setQuery('')
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
