import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles.css'
import App from './App.jsx'
import Presenter from './Presenter.jsx'

const params = new URLSearchParams(location.search)
const presentador = params.has('presentador')
if (params.has('estatico')) document.documentElement.classList.add('estatico')

createRoot(document.getElementById('root')).render(
  <StrictMode>{presentador ? <Presenter /> : <App />}</StrictMode>,
)
