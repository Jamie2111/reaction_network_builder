import { Fragment } from 'react'
import {
  ARTICLE_SECTIONS,
  PAGE,
  REFERENCES,
  type ArticleSection,
  type SectionWidget,
} from './content'

import 'katex/dist/katex.min.css'
import 'katex/dist/contrib/mhchem.mjs'
import LatexRenderer from './LatexRenderer'
import ReactionBuilder from './ReactionBuilder'
import {
  InteractiveChainDiagram,
  MPOFigure,
  MPSFigure,
} from './TensorDiagram'
import './App.css'

// Render text containing inline math ($...$), citation tokens ([[c:5]] or [[c:1,2]]),
// and markdown-style links ([text](url)).
const renderRich = (text: string) => {
  return text
    .split(/(\$[^$]+\$|\[\[c:[\d,]+\]\]|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <LatexRenderer
            key={index}
            latex={part.slice(1, -1)}
            className="inline-latex"
            displayMode={false}
          />
        )
      }

      const cite = part.match(/^\[\[c:([\d,]+)\]\]$/)
      if (cite) {
        return (
          <span key={index}>
            {cite[1].split(',').map((n) => (
              <a key={n} className="citation" href={`#ref-${n}`}>
                [{n}]
              </a>
            ))}
          </span>
        )
      }

      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        return (
          <a key={index} href={link[2]} target="_blank" rel="noreferrer">
            {link[1]}
          </a>
        )
      }

      return <span key={index}>{part}</span>
    })
}

function App() {
  const renderWidget = (widget: SectionWidget, key: string) => {
    switch (widget) {
      case 'builder':
        return (
          <div key={key}>
            <ReactionBuilder />
          </div>
        )
      case 'mpsFig':
        return <MPSFigure key={key} />
      case 'mpoFig':
        return <MPOFigure key={key} />
      case 'interactiveChain':
        return <InteractiveChainDiagram key={key} seedSites={4} />
    }
  }

  const renderSection = (section: ArticleSection) => (
    <Fragment key={section.id}>
      <h2 id={section.id}>{section.title}</h2>

      {section.body.map((block, index) => {
        const key = `${section.id}-${index}`
        switch (block.kind) {
          case 'p':
            return <p key={key}>{renderRich(block.text)}</p>
          case 'eq':
            return (
              <div key={key} className="tn-eq">
                <LatexRenderer latex={block.latex} />
              </div>
            )
          case 'bullets':
            return (
              <ul key={key}>
                {block.items.map((item) => (
                  <li key={item}>{renderRich(item)}</li>
                ))}
              </ul>
            )
          case 'widget':
            return <Fragment key={key}>{renderWidget(block.widget, key)}</Fragment>
        }
      })}
    </Fragment>
  )

  return (
    <div className="container">
      {/* Top navigation, replicating the TensorNetwork.org page chrome */}
      <div className="row" style={{ marginTop: '2%' }}>
        <span className="twelve columns">
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '10%' }}>
                  <a href="https://tensornetwork.org/">
                    <img
                      style={{
                        height: '100%',
                        maxHeight: '40px',
                        marginTop: '5px',
                        marginRight: '10px',
                        verticalAlign: 'middle',
                      }}
                      src="/tn_logo.png"
                      alt="Tensor Network"
                    />
                  </a>
                </td>
                <td style={{ width: '90%' }} className="top_navbar">
                  {'  '}
                  <a href="https://tensornetwork.org/about/">About</a>{' '}
                  <a href="https://tensornetwork.org/contribute/">Contribute</a>{' '}
                  <a href="https://github.com/tensornetwork/tensornetwork.org">Source</a>
                </td>
              </tr>
              <tr>
                <td></td>
                <td className="backlinks">
                  <a href="https://tensornetwork.org/">main</a>/stoch_kin/
                </td>
              </tr>
            </tbody>
          </table>
        </span>
      </div>
      <br />
      <div className="row" style={{ marginTop: '2%' }}></div>

      {/* Page content, kept flat under .container exactly like a generated TN page */}
      <h1>{PAGE.title}</h1>

      <div className="toc">
        <b>Table of Contents</b>
        <br />
        <br />
        <ul>
          {ARTICLE_SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
          <li>
            <a href="#references">References</a>
          </li>
        </ul>
      </div>

      {PAGE.synopsis.map((paragraph, index) => (
        <p key={`synopsis-${index}`}>{renderRich(paragraph)}</p>
      ))}

      {ARTICLE_SECTIONS.map(renderSection)}

      <h2 id="references">References</h2>
      <ol>
        {REFERENCES.map((reference) => (
          <li key={reference.n} id={`ref-${reference.n}`}>
            {reference.text}
            {reference.href ? (
              <>
                {' '}
                <a href={reference.href} target="_blank" rel="noreferrer">
                  {reference.hrefLabel}
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ol>

      <br />
      <a href="https://github.com/Jamie2111/reaction_network_builder">Edit This Page</a>
      <br />
      <br />
    </div>
  )
}

export default App
