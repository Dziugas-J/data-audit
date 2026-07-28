const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002'
const API_URL = `${BASE_URL}/query`
const SAVED_URL = `${BASE_URL}/saved`

const fetchJson = (url, options) =>
  fetch(url, options).then((res) => {
    if (!res.ok) throw new Error('Request failed')
    return res.json()
  })

export const searchDatasets = (query, fileType, licenseClass) =>
  fetchJson(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, file_type: fileType, license_class: licenseClass }),
  })

export const saveDataset = (dataset) =>
  fetchJson(SAVED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataset),
  })

export const fetchSavedDatasets = () => fetchJson(SAVED_URL)

export const removeDataset = (url) =>
  fetchJson(SAVED_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
