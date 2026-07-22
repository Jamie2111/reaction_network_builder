import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// The actual TensorNetwork.org stylesheets, used verbatim so the page inherits
// the site's exact typography, link colours, grid, and chrome.
import './tn-styles/normalize.css'
import './tn-styles/skeleton.css'
import './tn-styles/style.css'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
