import { Fragment, useState, useEffect } from 'react'
import { formatReactionEquation, formatSecondQuantizedForm, type RawElementaryStep, type ReactionType } from './utils'
import {
  ARTICLE_SECTIONS,
  PAGE,
  REFERENCES,
  SCHLOGL_PRESET,
  type ArticleSection,
  type SectionWidget,
} from './content'

import 'katex/dist/katex.min.css'
import 'katex/dist/contrib/mhchem.mjs'
import LatexRenderer from './LatexRenderer'
import {
  ContractionFigure,
  FactorTensorFigure,
  InteractiveChainDiagram,
  LiveOperatorDiagram,
  MPOFigure,
  MPSFigure,
} from './TensorDiagram'
import './App.css'

const STORAGE_KEYS = {
  STEPS: 'elementary-steps',
  CURRENT_STEP: 'current-elementary-step',
}

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const loadFromStorage = function <T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultValue
  }
}

const emptyCurrentStep = {
  id: '',
  reactants: 'A + B',
  products: 'C + D',
  type: 'forward' as ReactionType,
  forwardRate: 'c_f',
  reverseRate: 'c_r',
}

// Render text containing inline math ($...$) and citation tokens ([[c:5]] or [[c:1,2]]).
const renderRich = (text: string) => {
  return text
    .split(/(\$[^$]+\$|\[\[c:[\d,]+\]\])/g)
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

      return <span key={index}>{part}</span>
    })
}

const SecondQuantizedRenderer: React.FC<{
  step: RawElementaryStep
  context?: 'preview' | 'visualization'
  stepIndex?: number
}> = ({ step, context = 'preview', stepIndex }) => {
  const secondQuantizedForm = formatSecondQuantizedForm(step, context, stepIndex)

  if (typeof secondQuantizedForm === 'string') {
    return <LatexRenderer latex={secondQuantizedForm} className="latex-equation" />
  }

  return (
    <div className="equilibrium-forms">
      <div className="equilibrium-scroll-container">
        <div className="equilibrium-form">
          <span className="form-label">Forward:</span>
          <LatexRenderer latex={secondQuantizedForm.forward} className="latex-equation" />
        </div>
        <div className="equilibrium-form">
          <span className="form-label">Reverse:</span>
          <LatexRenderer latex={secondQuantizedForm.backward} className="latex-equation" />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [steps, setSteps] = useState<RawElementaryStep[]>(() =>
    loadFromStorage(STORAGE_KEYS.STEPS, []),
  )

  const [currentStep, setCurrentStep] = useState<RawElementaryStep>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_STEP, { ...emptyCurrentStep }),
  )

  const [idCounter, setIdCounter] = useState(() => Date.now())

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STEPS, steps)
  }, [steps])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_STEP, currentStep)
  }, [currentStep])

  const cycleReactionType = () => {
    const typeOrder: ReactionType[] = ['forward', 'equilibrium', 'reverse']
    const currentIndex = typeOrder.indexOf(currentStep.type)
    const nextIndex = (currentIndex + 1) % typeOrder.length
    setCurrentStep({ ...currentStep, type: typeOrder[nextIndex] })
  }

  const getArrowSymbol = (type: ReactionType) => {
    switch (type) {
      case 'forward':
        return '→'
      case 'equilibrium':
        return '⇌'
      case 'reverse':
        return '←'
    }
  }

  const addStep = () => {
    if (currentStep.reactants.trim() && currentStep.products.trim() && currentStep.forwardRate.trim()) {
      const newStep = { ...currentStep, id: `step-${idCounter}` }
      setSteps([...steps, newStep])
      setIdCounter((prev) => prev + 1)
      setCurrentStep(currentStep)
    }
  }

  const loadSchloglPreset = () => {
    const nextSteps = SCHLOGL_PRESET.map((step, index) => ({
      ...step,
      id: `step-${idCounter + index}`,
    }))

    setSteps(nextSteps)
    setCurrentStep({ ...SCHLOGL_PRESET[0], id: '' })
    setIdCounter((prev) => prev + SCHLOGL_PRESET.length)
  }

  const clearMechanism = () => {
    setSteps([])
    setCurrentStep({ ...emptyCurrentStep })
  }

  const deleteStep = (id: string) => {
    setSteps((prevSteps) => prevSteps.filter((step) => step.id !== id))
  }

  const renderBuilder = () => (
    <div className="builder-panel">
      <div className="builder-grid">
        <div className="step-builder">
          <h4 className="form-title">Add an elementary step</h4>

          <div className="paper-tools">
            <p className="paper-tools-copy">
              Load the reversible Schlogl model, a standard bistable test case, or clear the mechanism and
              build your own.
            </p>
            <div className="paper-tools-actions">
              <button className="secondary-btn" onClick={loadSchloglPreset} type="button">
                Load Schlogl preset
              </button>
              <button
                className="secondary-btn secondary-btn-light"
                onClick={clearMechanism}
                type="button"
              >
                Clear mechanism
              </button>
            </div>
          </div>

          <div className="reaction-builder">
            <div className="reactants-section">
              <textarea
                className="species-input reactants-input"
                placeholder="A + B"
                value={currentStep.reactants}
                onChange={(e) => setCurrentStep({ ...currentStep, reactants: e.target.value })}
                rows={2}
              />
            </div>

            <div className="arrow-section">
              <div
                className={`arrow-button-container ${
                  currentStep.type === 'forward' || currentStep.type === 'equilibrium'
                    ? 'has-top-input'
                    : ''
                } ${
                  currentStep.type === 'reverse' || currentStep.type === 'equilibrium'
                    ? 'has-bottom-input'
                    : ''
                }`}
              >
                <div className="rate-input-container rate-above">
                  {currentStep.type === 'forward' || currentStep.type === 'equilibrium' ? (
                    <div className="rate-input-group">
                      <input
                        type="text"
                        className="rate-input"
                        placeholder="c_f"
                        value={currentStep.forwardRate}
                        onChange={(e) => setCurrentStep({ ...currentStep, forwardRate: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="rate-input-placeholder"></div>
                  )}
                </div>

                <button
                  className="arrow-button"
                  onClick={cycleReactionType}
                  title="Click to cycle between forward, equilibrium, and reverse reactions"
                >
                  {getArrowSymbol(currentStep.type)}
                </button>

                <div className="rate-input-container rate-below">
                  {currentStep.type === 'reverse' || currentStep.type === 'equilibrium' ? (
                    <div className="rate-input-group">
                      <input
                        type="text"
                        className="rate-input"
                        placeholder="c_r"
                        value={currentStep.reverseRate}
                        onChange={(e) => setCurrentStep({ ...currentStep, reverseRate: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="rate-input-placeholder"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="products-section">
              <textarea
                className="species-input products-input"
                placeholder="C + D"
                value={currentStep.products}
                onChange={(e) => setCurrentStep({ ...currentStep, products: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="equation-preview">
            <h5 className="preview-title">Balanced equation</h5>
            <div className="preview-equation">
              <LatexRenderer latex={formatReactionEquation(currentStep)} className="latex-equation" />
            </div>
          </div>

          <div className="equation-preview">
            <h5 className="preview-title">Operator form</h5>
            <div className="preview-equation">
              <SecondQuantizedRenderer step={currentStep} />
            </div>
          </div>

          <button
            className="add-step-btn"
            onClick={addStep}
            disabled={
              !currentStep.reactants.trim() ||
              !currentStep.products.trim() ||
              !currentStep.forwardRate.trim()
            }
          >
            Add elementary step
          </button>
        </div>

        <div className="steps-list">
          <h4 className="form-title">Mechanism ({steps.length} steps)</h4>

          {steps.length === 0 ? (
            <div className="empty-state">
              <p>No elementary steps yet.</p>
              <p>Add steps on the left, or load the preset, to build a generator.</p>
            </div>
          ) : (
            <div className="steps-container">
              {steps.map((step, index) => (
                <div key={step.id} className="step-card">
                  <div className="step-header">
                    <span className="step-number">Step {index + 1}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteStep(step.id)
                      }}
                      title="Delete this step"
                    >
                      ×
                    </button>
                  </div>

                  <div className="step-equation">
                    <LatexRenderer latex={formatReactionEquation(step)} className="latex-equation" />
                  </div>

                  <div className="step-second-quantized">
                    <SecondQuantizedRenderer step={step} context="visualization" stepIndex={index} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderWidget = (widget: SectionWidget, key: string) => {
    switch (widget) {
      case 'builder':
        return <div key={key}>{renderBuilder()}</div>
      case 'liveOperator':
        return <LiveOperatorDiagram key={key} step={currentStep} />
      case 'factorFig':
        return <FactorTensorFigure key={key} />
      case 'contractionFig':
        return <ContractionFigure key={key} />
      case 'mpsFig':
        return <MPSFigure key={key} />
      case 'mpoFig':
        return <MPOFigure key={key} />
      case 'interactiveChain':
        return <InteractiveChainDiagram key={key} seedSites={Math.max(steps.length + 3, 4)} />
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
                  {'\u00A0 '}
                  <a href="https://tensornetwork.org/about/">About</a>{' '}
                  <a href="https://tensornetwork.org/contribute/">Contribute</a>{' '}
                  <a href="https://github.com/tensornetwork/tensornetwork.org">Source</a>
                </td>
              </tr>
              <tr>
                <td></td>
                <td className="backlinks">
                  <a href="https://tensornetwork.org/">main</a>/doi_peliti/
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
