import { useState, useEffect } from 'react'
import './App.css'
import { formatReactionEquation, formatSecondQuantizedForm, type RawElementaryStep, type ReactionType } from './utils'
import { FULL_PAPER, PAPER_DETAILS, PAPER_SECTIONS, SCHLOGL_PRESET, type FullPaperSection, type PedagogySection } from './content'

import 'katex/dist/katex.min.css'
import "katex/dist/contrib/mhchem.mjs";
import LatexRenderer from './LatexRenderer'

const STORAGE_KEYS = {
  STEPS: 'elementary-steps',
  CURRENT_STEP: 'current-elementary-step'
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = function <T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

const emptyCurrentStep = {
  id: '',
  reactants: 'A + B',
  products: 'C + D',
  type: 'forward' as ReactionType,
  forwardRate: 'c_f',
  reverseRate: 'c_r',
};

const renderInlineMath = (text: string) => {
  return text.split(/(\$[^$]+\$)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <LatexRenderer
          key={`${part}-${index}`}
          latex={part.slice(1, -1)}
          className="inline-latex"
          displayMode={false}
        />
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const PedagogyPanel: React.FC<{ section: PedagogySection; defaultOpen?: boolean }> = ({
  section,
  defaultOpen = false,
}) => {
  return (
    <details className="pedagogy-panel" open={defaultOpen}>
      <summary className="pedagogy-summary">
        <span className="pedagogy-title">{section.title}</span>
        <span className="pedagogy-tagline">{section.summary}</span>
      </summary>

      <div className="pedagogy-content">
        {section.paragraphs.map((paragraph, index) => (
          <p key={`${section.id}-paragraph-${index}`} className="pedagogy-paragraph">
            {renderInlineMath(paragraph)}
          </p>
        ))}

        {section.equations?.map((equation, index) => (
          <div key={`${section.id}-equation-${index}`} className="pedagogy-equation">
            {equation.label ? <p className="pedagogy-equation-label">{equation.label}</p> : null}
            <div className="pedagogy-equation-box">
              <LatexRenderer latex={equation.latex} className="latex-equation" />
            </div>
          </div>
        ))}

        {section.bullets?.length ? (
          <ul className="pedagogy-list">
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
};

const FullPaperPanel: React.FC<{ section: FullPaperSection }> = ({ section }) => {
  return (
    <section className="full-paper-section">
      <h4 className="full-paper-section-title">{section.title}</h4>

      {section.paragraphs.map((paragraph, index) => (
        <p key={`${section.id}-paragraph-${index}`} className="pedagogy-paragraph">
          {renderInlineMath(paragraph)}
        </p>
      ))}

      {section.equations?.map((equation, index) => (
        <div key={`${section.id}-equation-${index}`} className="pedagogy-equation">
          {equation.label ? <p className="pedagogy-equation-label">{equation.label}</p> : null}
          <div className="pedagogy-equation-box">
            <LatexRenderer latex={equation.latex} className="latex-equation" />
          </div>
        </div>
      ))}

      {section.bullets?.length ? (
        <ul className="pedagogy-list">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

const SecondQuantizedRenderer: React.FC<{
  step: RawElementaryStep;
  context?: 'preview' | 'visualization';
  stepIndex?: number;
}> = ({ step, context = 'preview', stepIndex }) => {
  const secondQuantizedForm = formatSecondQuantizedForm(step, context, stepIndex);

  if (typeof secondQuantizedForm === 'string') {
    return (
      <LatexRenderer
        latex={secondQuantizedForm}
        className="latex-equation"
      />
    );
  } else {
    const forwardLabel = context === 'preview' ? 'Forward:' : 'Forward:';
    const reverseLabel = context === 'preview' ? 'Reverse:' : 'Reverse:';

    return (
      <div className="equilibrium-forms">
        <div className="equilibrium-scroll-container">
          <div className="equilibrium-form">
            <span className="form-label">{forwardLabel}</span>
            <LatexRenderer
              latex={secondQuantizedForm.forward}
              className="latex-equation"
            />
          </div>
          <div className="equilibrium-form">
            <span className="form-label">{reverseLabel}</span>
            <LatexRenderer
              latex={secondQuantizedForm.backward}
              className="latex-equation"
            />
          </div>
        </div>
      </div>
    );
  }
};

function App() {
  const [steps, setSteps] = useState<RawElementaryStep[]>(() =>
    loadFromStorage(STORAGE_KEYS.STEPS, [])
  );

  const [currentStep, setCurrentStep] = useState<RawElementaryStep>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_STEP, {
      ...emptyCurrentStep,
    })
  );

  const [idCounter, setIdCounter] = useState(() => Date.now());

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STEPS, steps);
  }, [steps]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  const cycleReactionType = () => {
    const typeOrder: ReactionType[] = ['forward', 'equilibrium', 'reverse'];
    const currentIndex = typeOrder.indexOf(currentStep.type);
    const nextIndex = (currentIndex + 1) % typeOrder.length;
    setCurrentStep({
      ...currentStep,
      type: typeOrder[nextIndex]
    });
  };

  const getArrowSymbol = (type: ReactionType) => {
    switch (type) {
      case 'forward': return '→';
      case 'equilibrium': return '⇌';
      case 'reverse': return '←';
    }
  };

  const addStep = () => {
    if (currentStep.reactants.trim() && currentStep.products.trim() && currentStep.forwardRate.trim()) {
      const newStep = {
        ...currentStep,
        id: `step-${idCounter}`
      };
      setSteps([...steps, newStep]);
      setIdCounter(prev => prev + 1);
      setCurrentStep(currentStep);
    }
  };

  const loadSchloglPreset = () => {
    const nextSteps = SCHLOGL_PRESET.map((step, index) => ({
      ...step,
      id: `step-${idCounter + index}`
    }));

    setSteps(nextSteps);
    setCurrentStep({ ...SCHLOGL_PRESET[0], id: '' });
    setIdCounter((prev) => prev + SCHLOGL_PRESET.length);
  };

  const clearMechanism = () => {
    setSteps([]);
    setCurrentStep({ ...emptyCurrentStep });
  };

  const deleteStep = (id: string) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== id));
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h3 className="title">Reaction Network Builder</h3>
          {/* <p className="subtitle">Define elementary reaction steps</p> */}
        </header>
        {/* <LatexRenderer
          latex={String.raw`E = m c^2 \quad \htmlClass{clickable}{m} \; c^2`}
        /> */}

        <div className="main-content">
          <div className="step-builder">
            <h2 className="form-title">Add Elementary Step</h2>

            <div className="paper-tools">
              <div className="paper-tools-header">
                <h3 className="paper-tools-title">Paper Preset</h3>
                <p className="paper-tools-copy">
                  Load the reversible Schlogl model used throughout the Nicholson-Gingrich rate-switching example.
                </p>
              </div>

              <div className="paper-tools-actions">
                <button
                  className="secondary-btn"
                  onClick={loadSchloglPreset}
                  type="button"
                >
                  Load Schlogl Preset
                </button>
                <button
                  className="secondary-btn secondary-btn-light"
                  onClick={clearMechanism}
                  type="button"
                >
                  Clear Mechanism
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
                <div className={`arrow-button-container ${(currentStep.type === 'forward' || currentStep.type === 'equilibrium') ? 'has-top-input' : ''
                  } ${(currentStep.type === 'reverse' || currentStep.type === 'equilibrium') ? 'has-bottom-input' : ''
                  }`}>
                  <div className="rate-input-container rate-above">
                    {(currentStep.type === 'forward' || currentStep.type === 'equilibrium') ? (
                      <div className="rate-input-group">
                        {/* <label className="rate-label">
                          <LatexRenderer latex="k_f" className="latex-label" />
                        </label> */}
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
                    {(currentStep.type === 'reverse' || currentStep.type === 'equilibrium') ? (
                      <div className="rate-input-group">
                        <input
                          type="text"
                          className="rate-input"
                          placeholder="k_r"
                          value={currentStep.reverseRate}
                          onChange={(e) => setCurrentStep({ ...currentStep, reverseRate: e.target.value })}
                        />
                        {/* <label className="rate-label">
                          <LatexRenderer latex="k_r" className="latex-label" />
                        </label> */}
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
              <h3 className="preview-title">Preview:</h3>
              <div className="preview-equation">
                <LatexRenderer
                  latex={formatReactionEquation(currentStep)}
                  className="latex-equation"
                />
              </div>
            </div>

            {/* <div className="second-quantized-input">
              <h3 className="form-subtitle">Second-Quantized Form (Optional):</h3>
              <textarea
                className="second-quantized-textarea"
                placeholder="Enter LaTeX for second-quantized form (e.g., \hat{H} = \sum_{i,j} t_{ij} \hat{a}^\dagger_i \hat{a}_j)"
                value={currentStep.secondQuantizedForm}
                onChange={(e) => setCurrentStep({ ...currentStep, secondQuantizedForm: e.target.value })}
                rows={3}
              />
            </div> */}

            <div className="equation-preview">
              <h3 className="preview-title">Second-Quantized Form:</h3>
              <div className="preview-equation">
                <SecondQuantizedRenderer step={currentStep} />
              </div>
            </div>

            <button
              className="add-step-btn"
              onClick={addStep}
              disabled={!currentStep.reactants.trim() || !currentStep.products.trim() || !currentStep.forwardRate.trim()}
            >
              Add Elementary Step
            </button>
          </div>

          <div className="steps-list">
            <h2 className="form-title">Reaction Mechanism ({steps.length} steps)</h2>

            {steps.length === 0 ? (
              <div className="empty-state">
                <p>No elementary steps added yet.</p>
                <p>Build your reaction mechanism by adding steps above.</p>
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
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                        title="Delete this step"
                      >×</button>
                    </div>

                    <div className="step-equation">
                      <LatexRenderer
                        latex={formatReactionEquation(step)}
                        className="latex-equation"
                      />
                    </div>

                    <div className="step-second-quantized">
                      <SecondQuantizedRenderer
                        step={step}
                        context="visualization"
                        stepIndex={index}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section className="paper-companion">
              <div className="paper-companion-header">
                <h2 className="form-title paper-companion-title">Paper Companion</h2>
                <div className="paper-meta-card">
                  <p className="paper-meta-title">{PAPER_DETAILS.title}</p>
                  <p className="paper-meta-line">{PAPER_DETAILS.authors}</p>
                  <p className="paper-meta-line">{PAPER_DETAILS.journal}</p>
                  <p className="paper-meta-line">DOI: {PAPER_DETAILS.doi}</p>
                </div>
              </div>

              <div className="paper-panels">
                {PAPER_SECTIONS.map((section, index) => (
                  <PedagogyPanel
                    key={section.id}
                    section={section}
                    defaultOpen={index === 0}
                  />
                ))}

                <details className="pedagogy-panel" open={false}>
                  <summary className="pedagogy-summary">
                    <span className="pedagogy-title">{FULL_PAPER.title}</span>
                    <span className="pedagogy-tagline">{FULL_PAPER.intro}</span>
                  </summary>

                  <div className="pedagogy-content full-paper-content">
                    {FULL_PAPER.sections.map((section) => (
                      <FullPaperPanel key={section.id} section={section} />
                    ))}

                    <section className="full-paper-section">
                      <h4 className="full-paper-section-title">References</h4>
                      <ol className="full-paper-references">
                        {FULL_PAPER.references.map((reference) => (
                          <li key={reference}>{reference}</li>
                        ))}
                      </ol>
                    </section>
                  </div>
                </details>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
