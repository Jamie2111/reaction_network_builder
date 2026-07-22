import { useMemo, useState } from 'react'
import { parseRawElementaryStep, type RawElementaryStep } from './utils'

//
// Tensor diagram primitives, following the TensorNetwork.org conventions:
//   - a tensor is a shaded shape,
//   - an index is a line emanating from a shape,
//   - connecting two index lines denotes a contraction,
//   - an identity is just a plain line with no shape.
// See https://tensornetwork.org/diagrams/
//

type LegDir = 'up' | 'down' | 'left' | 'right'

const LEG = 26 // default leg length in svg units

const legEnd = (x: number, y: number, dir: LegDir, len = LEG) => {
  switch (dir) {
    case 'up': return { x, y: y - len }
    case 'down': return { x, y: y + len }
    case 'left': return { x: x - len, y }
    case 'right': return { x: x + len, y }
  }
}

interface LegSpec {
  dir: LegDir
  len?: number
  /** label drawn at the dangling end (an external/physical index) */
  label?: string
  /** internal indices (bonds) are drawn a touch heavier */
  bond?: boolean
}

interface NodeProps {
  x: number
  y: number
  label?: string
  /** circle = generic factor tensor, square = operator/MPO tensor */
  shape?: 'circle' | 'square'
  r?: number
  legs?: LegSpec[]
}

// Render an index label like "n_1" with the part after "_" as a real subscript.
const renderLabel = (label: string): React.ReactNode => {
  const us = label.indexOf('_')
  if (us === -1) return label
  return (
    <>
      {label.slice(0, us)}
      <tspan dy="3" fontSize="0.72em">
        {label.slice(us + 1)}
      </tspan>
    </>
  )
}

const TensorNode: React.FC<NodeProps> = ({ x, y, label, shape = 'circle', r = 17, legs = [] }) => (
  <g>
    {legs.map((leg, i) => {
      const end = legEnd(x, y, leg.dir, leg.len ?? LEG)
      const lx = legEnd(x, y, leg.dir, (leg.len ?? LEG) + 11).x
      const ly = legEnd(x, y, leg.dir, (leg.len ?? LEG) + 11).y
      return (
        <g key={i}>
          <line
            x1={x}
            y1={y}
            x2={end.x}
            y2={end.y}
            className={leg.bond ? 'td-bond' : 'td-leg'}
          />
          {leg.label ? (
            <text x={lx} y={ly + 4} className="td-index-label" textAnchor="middle">
              {renderLabel(leg.label)}
            </text>
          ) : null}
        </g>
      )
    })}
    {shape === 'circle' ? (
      <circle cx={x} cy={y} r={r} className="td-tensor" />
    ) : (
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={3} className="td-tensor" />
    )}
    {label ? (
      <text x={x} y={y + 5} className="td-tensor-label" textAnchor="middle">
        {renderLabel(label)}
      </text>
    ) : null}
  </g>
)

interface FigureProps {
  caption?: React.ReactNode
  /** rendered width cap in px; the SVG scales to this, height follows the viewBox */
  maxWidth?: number
  viewBox: string
  children: React.ReactNode
}

const Figure: React.FC<FigureProps> = ({ caption, maxWidth = 520, viewBox, children }) => (
  <figure className="td-figure">
    <svg
      className="td-svg"
      viewBox={viewBox}
      role="img"
      style={{ maxWidth }}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
    {caption ? <figcaption className="td-caption">{caption}</figcaption> : null}
  </figure>
)

//
// Static figure: a single factor tensor of order 3.
//
export const FactorTensorFigure: React.FC = () => (
  <Figure
    maxWidth={300}
    viewBox="0 24 260 88"
    caption={
      <>
        A single <b>factor tensor</b>. Each line is an index, and the number of lines is the{' '}
        <b>order</b> of the tensor (here, order 3). The number of values an index can take is its{' '}
        <b>dimension</b>.
      </>
    }
  >
    <TensorNode
      x={130}
      y={80}
      label="T"
      legs={[
        { dir: 'left', label: 'i' },
        { dir: 'up', label: 'j' },
        { dir: 'right', label: 'k' },
      ]}
    />
  </Figure>
)

//
// Static figure: contraction of two tensors, internal vs external indices.
//
export const ContractionFigure: React.FC = () => (
  <Figure
    maxWidth={420}
    viewBox="0 30 320 86"
    caption={
      <>
        A <b>contraction</b> of two tensors: the connected line denotes summation over the shared index. That
        line is an <b>internal index</b>, and the uncontracted lines are <b>external indices</b>.
      </>
    }
  >
    <line x1={130} y1={85} x2={190} y2={85} className="td-bond" />
    <text x={160} y={75} className="td-index-label" textAnchor="middle">
      j
    </text>
    <TensorNode x={113} y={85} label="M" legs={[{ dir: 'left', label: 'i' }]} />
    <TensorNode
      x={207}
      y={85}
      label="N"
      legs={[
        { dir: 'up', label: 'k' },
        { dir: 'right', label: 'l' },
      ]}
    />
  </Figure>
)

//
// Static figure: a Matrix Product State for the probability vector |p(t)>.
//
export const MPSFigure: React.FC<{ sites?: number }> = ({ sites = 5 }) => {
  const start = 44
  const gap = 62
  const y = 72
  const xs = Array.from({ length: sites }, (_, i) => start + i * gap)
  return (
    <Figure
      maxWidth={440}
      viewBox={`0 0 ${start * 2 + (sites - 1) * gap} 150`}
      caption={
        <>
          A <b>Matrix Product State</b> for the probability vector{' '}
          <span className="td-inline-math">|p(t)&rang;</span>. Each factor tensor carries a vertical{' '}
          <b>external index</b> (a local occupation number) and is connected to its neighbors by horizontal{' '}
          <b>internal</b> (bond) <b>indices</b>.
        </>
      }
    >
      {xs.slice(0, -1).map((x, i) => (
        <line key={i} x1={x} y1={y} x2={xs[i + 1]} y2={y} className="td-bond" />
      ))}
      {xs.map((x, i) => (
        <TensorNode key={i} x={x} y={y} r={17} legs={[{ dir: 'down', label: `n_${i + 1}`, len: 26 }]} />
      ))}
    </Figure>
  )
}

//
// Static figure: a Matrix Product Operator for the generator H-hat.
//
export const MPOFigure: React.FC<{ sites?: number }> = ({ sites = 5 }) => {
  const start = 44
  const gap = 62
  const y = 80
  const xs = Array.from({ length: sites }, (_, i) => start + i * gap)
  return (
    <Figure
      maxWidth={440}
      viewBox={`0 0 ${start * 2 + (sites - 1) * gap} 165`}
      caption={
        <>
          A <b>Matrix Product Operator</b> for the generator{' '}
          <span className="td-inline-math">H&#770;</span>. Each factor tensor carries an upper and a lower{' '}
          external index, mapping occupation states to occupation states, and is connected to its neighbors by
          internal bond indices.
        </>
      }
    >
      {xs.slice(0, -1).map((x, i) => (
        <line key={i} x1={x} y1={y} x2={xs[i + 1]} y2={y} className="td-bond" />
      ))}
      {xs.map((x, i) => (
        <TensorNode
          key={i}
          x={x}
          y={y}
          shape="square"
          r={17}
          legs={[
            { dir: 'up', len: 26, label: `n_${i + 1}` },
            { dir: 'down', len: 26, label: `n′_${i + 1}` },
          ]}
        />
      ))}
    </Figure>
  )
}

//
// Live figure: the operator term for the current reaction step, drawn as a
// small tensor network acting on the occupation-number line of each species.
//
export const LiveOperatorDiagram: React.FC<{ step: RawElementaryStep }> = ({ step }) => {
  const species = useMemo(() => {
    const parsed = parseRawElementaryStep(step)
    const names: string[] = []
    const created: Record<string, number> = {}
    const removed: Record<string, number> = {}
    parsed.products.forEach((s) => {
      if (!names.includes(s.name)) names.push(s.name)
      created[s.name] = (created[s.name] ?? 0) + s.coeff
    })
    parsed.reactants.forEach((s) => {
      if (!names.includes(s.name)) names.push(s.name)
      removed[s.name] = (removed[s.name] ?? 0) + s.coeff
    })
    return names.map((name) => ({ name, created: created[name] ?? 0, removed: removed[name] ?? 0 }))
  }, [step])

  if (species.length === 0) {
    return (
      <div className="td-empty">Enter reactants and products to see the operator diagram.</div>
    )
  }

  const rowH = 64
  const left = 30
  const right = 380
  const opX = (right + left) / 2
  const height = species.length * rowH + 28

  return (
    <Figure
      maxWidth={460}
      viewBox={`0 0 410 ${height}`}
      caption={
        <>
          The current step represented as a generator term acting on the occupation line of each species. A
          shaded box is a creation operator <span className="td-inline-math">a&#8224;</span>, and an open box is
          an annihilation operator <span className="td-inline-math">a</span>; the exponent gives the number of
          molecules created or removed. The two external lines on each row are the incoming and outgoing
          occupation indices.
        </>
      }
    >
      {species.map((s, i) => {
        const y = 30 + i * rowH
        const boxes: React.ReactNode[] = []
        // annihilation boxes (open) then creation boxes (shaded), reading left to right
        let bx = opX - 40
        if (s.removed > 0) {
          boxes.push(
            <g key="rm">
              <rect x={bx - 16} y={y - 16} width={32} height={32} rx={3} className="td-op-open" />
              <text x={bx} y={y + 5} className="td-op-label" textAnchor="middle">
                a{s.removed > 1 ? <tspan dy={-7} fontSize="10">{s.removed}</tspan> : null}
              </text>
            </g>,
          )
          bx += 56
        }
        if (s.created > 0) {
          boxes.push(
            <g key="cr">
              <rect x={bx - 16} y={y - 16} width={32} height={32} rx={3} className="td-op-fill" />
              <text x={bx} y={y + 5} className="td-op-label-light" textAnchor="middle">
                a&#8224;{s.created > 1 ? <tspan dy={-7} fontSize="10">{s.created}</tspan> : null}
              </text>
            </g>,
          )
        }
        return (
          <g key={s.name}>
            <line x1={left} y1={y} x2={right} y2={y} className="td-leg" />
            <text x={left - 6} y={y + 4} className="td-index-label" textAnchor="end">
              {s.name}
            </text>
            {boxes}
          </g>
        )
      })}
    </Figure>
  )
}

//
// Live, interactive figure: the generator H-hat and state |p(t)> as tensor
// networks on a chain of diffusing voxels. The reader sets the number of sites
// and the bond dimension and watches the diagram and the state-space counts
// update. This is the tensor-network picture the 2023 paper builds on.
//
export const InteractiveChainDiagram: React.FC<{ seedSites?: number }> = ({ seedSites = 5 }) => {
  const [sites, setSites] = useState(Math.min(Math.max(seedSites, 3), 9))
  const [chi, setChi] = useState(8)
  const [trunc, setTrunc] = useState(4) // local occupation cut-off d

  const start = 46
  const gap = 64
  const yState = 62
  const xs = Array.from({ length: sites }, (_, i) => start + i * gap)
  const svgW = start * 2 + (sites - 1) * gap
  // bond-line thickness tracks the bond dimension, kept to a small visible range
  const bondWidth = 1.6 + ((chi - 1) / 31) * 2.6

  // a cut-off of d means occupations 0..d, i.e. d+1 local states (the physical dimension)
  const dim = trunc + 1
  // full state space (d+1)^L versus the MPS parameter count for an open-boundary chain:
  // two boundary tensors of size (d+1)*chi and (L-2) bulk tensors of size (d+1)*chi^2
  const full = Math.pow(dim, sites)
  const mps = (sites - 2) * chi * chi * dim + 2 * chi * dim
  const fmt = (n: number) =>
    n >= 1e6 ? n.toExponential(1) : n.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <div className="td-interactive">
      <Figure
        maxWidth={svgW}
        viewBox={`0 0 ${svgW} 120`}
        caption={
          <>
            The probability vector <span className="td-inline-math">|p(t)&rang;</span> represented as a Matrix
            Product State on <b>{sites}</b> sites. Vertical lines are external indices (local occupation with
            cut-off <span className="td-inline-math">d&nbsp;=&nbsp;{trunc}</span>, i.e.{' '}
            <span className="td-inline-math">d&#8202;+&#8202;1&nbsp;=&nbsp;{dim}</span> states); horizontal lines
            are internal bond indices of dimension <span className="td-inline-math">&chi;&nbsp;=&nbsp;{chi}</span>.
          </>
        }
      >
        {xs.slice(0, -1).map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={yState}
            x2={xs[i + 1]}
            y2={yState}
            className="td-bond"
            strokeWidth={bondWidth}
          />
        ))}
        {xs.map((x, i) => (
          <g key={i}>
            <TensorNode x={x} y={yState} r={17} legs={[{ dir: 'down', label: `n_${i + 1}`, len: 26 }]} />
            {i < xs.length - 1 ? (
              <text x={(x + xs[i + 1]) / 2} y={yState - 8} className="td-index-label" textAnchor="middle">
                &chi;
              </text>
            ) : null}
          </g>
        ))}
      </Figure>

      <div className="td-controls">
        <label>
          <span>Voxels (sites) L</span>
          <input
            type="range"
            min={3}
            max={9}
            value={sites}
            onChange={(e) => setSites(Number(e.target.value))}
          />
          <output>{sites}</output>
        </label>
        <label>
          <span>Bond dimension &chi;</span>
          <input
            type="range"
            min={1}
            max={32}
            value={chi}
            onChange={(e) => setChi(Number(e.target.value))}
          />
          <output>{chi}</output>
        </label>
        <label>
          <span>Occupation cut-off d</span>
          <input
            type="range"
            min={2}
            max={8}
            value={trunc}
            onChange={(e) => setTrunc(Number(e.target.value))}
          />
          <output>{trunc}</output>
        </label>
      </div>

      <div className="td-counts">
        <div>
          <span className="td-count-label">Full distribution</span>
          <span className="td-count-value">
            (d+1)<sup>L</sup> = {fmt(full)} numbers
          </span>
        </div>
        <div>
          <span className="td-count-label">Matrix Product State</span>
          <span className="td-count-value">&asymp; {fmt(mps)} numbers</span>
        </div>
      </div>
      <p className="td-note">
        Increasing the bond dimension &chi; raises the <b>rank</b> the representation can capture, improving
        accuracy at the cost of memory. The full distribution grows as{' '}
        <span className="td-inline-math">(d+1)&#8202;<sup>L</sup></span>, so a compressed tensor-network
        representation becomes necessary as the chain length increases.
      </p>
    </div>
  )
}
