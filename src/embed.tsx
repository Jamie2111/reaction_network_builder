import { createRoot } from 'react-dom/client'
// NOTE: KaTeX *stylesheet* is intentionally NOT imported here. tensornetwork.org
// already loads KaTeX CSS globally, so the widget reuses it rather than inlining
// ~1.4 MB of base64 fonts. (mhchem is a small JS extension and is kept.)
import 'katex/dist/contrib/mhchem.mjs'
import ReactionBuilder from './ReactionBuilder'
import { InteractiveChainDiagram } from './TensorDiagram'
import './App.css'

//
// Self-mounting widget bundle for embedding the interactive pieces into a
// tensornetwork.org page. The page markdown just needs the mount points:
//
//   <div id="rn-builder"></div>   (the reaction-network builder + live operator)
//   <div id="rn-chain"></div>     (the interactive chain / bond-dimension widget)
//
// plus <script src="stoch_kin_widget.js" defer></script> and the accompanying
// stoch_kin_widget.css. Each widget renders only if its div is present, so the
// same bundle works whether one or both mount points appear on the page.
//

const mount = (id: string, node: React.ReactElement) => {
  const el = document.getElementById(id)
  if (el) createRoot(el).render(node)
}

const init = () => {
  mount('rn-builder', <ReactionBuilder />)
  mount('rn-chain', <InteractiveChainDiagram seedSites={4} />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
