import type { RawElementaryStep } from './utils'

//
// Content model for the article. A section is an ordered list of blocks so that
// display equations sit inline, between the paragraphs that motivate them, the
// way a TensorNetwork.org page reads.
//

/** Interactive widgets and diagrams the page can drop into a section. */
export type SectionWidget =
  | 'builder'
  | 'liveOperator'
  | 'interactiveChain'
  | 'factorFig'
  | 'contractionFig'
  | 'mpsFig'
  | 'mpoFig'

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'eq'; latex: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'widget'; widget: SectionWidget }

export interface ArticleSection {
  /** anchor id, also used for the table of contents */
  id: string
  /** rendered as a level-2 heading */
  title: string
  body: Block[]
}

export interface Reference {
  n: number
  text: string
  /** outbound link to the paper, rendered as a trailing identifier like the TN.org references */
  href?: string
  hrefLabel?: string
}

export const SCHLOGL_PRESET: Omit<RawElementaryStep, 'id'>[] = [
  {
    reactants: '2X + A',
    products: '3X',
    type: 'equilibrium',
    forwardRate: 'c_1',
    reverseRate: 'c_2',
  },
  {
    reactants: 'B',
    products: 'X',
    type: 'equilibrium',
    forwardRate: 'c_3',
    reverseRate: 'c_4',
  },
]

export const PAGE = {
  title: 'Doi-Peliti Method',
  synopsis: [
    'The Doi-Peliti method[[c:1,2]] recasts the dynamics of a stochastic chemical reaction network as a single linear operator acting on a vector of configuration probabilities. Working in terms of integer molecule counts rather than continuous concentrations expresses each reaction as a product of creation and annihilation operators, and the combinatorial factors associated with indistinguishable reactants are generated automatically by the operator algebra.',
    'This operator representation is also the natural point of departure for tensor-network methods. The probability vector is represented as a Matrix Product State and the generator as a Matrix Product Operator, so that a state space growing as $d^{L}$ can be stored and propagated within a controllable memory budget[[c:7]]. The builder below assembles a reaction mechanism and displays the corresponding operator form and tensor diagrams.',
  ],
}

export const ARTICLE_SECTIONS: ArticleSection[] = [
  {
    id: 'counting',
    title: 'Why count molecules instead of concentrations',
    body: [
      {
        kind: 'p',
        text: 'Deterministic chemical kinetics tracks concentrations through coupled ordinary differential equations, a description that is accurate when every species is present in large numbers and its concentration is effectively continuous. That description fails when a species is present in only tens or hundreds of copies, as is common for gene products, intracellular signaling molecules, and reactions confined to small volumes. In this regime the copy number is a discrete integer that changes by a single molecule at each reaction event, and the timing of those events is a random process.',
      },
      {
        kind: 'p',
        text: 'The appropriate description is then a probability distribution over integer copy numbers. Writing $\\mathbf{n}$ for the vector of copy numbers of each species, $p(\\mathbf{n}, t)$ denotes the probability of configuration $\\mathbf{n}$ at time $t$, and its evolution obeys the chemical master equation[[c:3]], a linear rate equation with one term per reaction. The master equation is readily written but difficult to solve, since the number of accessible configurations grows combinatorially with the number of species and reactions[[c:4]].',
      },
      {
        kind: 'p',
        text: 'The Doi-Peliti method does not alter the underlying physics. It re-expresses the same master equation in an operator language that exposes its algebraic structure and, in particular, renders it amenable to tensor-network representation.',
      },
    ],
  },
  {
    id: 'operators',
    title: 'Reactions as operators',
    body: [
      {
        kind: 'p',
        text: 'Consider a single species, and let $|n\\rangle$ denote the state containing exactly $n$ molecules. These occupation-number states form a basis, and any probability distribution over copy numbers is a nonnegative linear combination of them. The state of the system is the probability vector expressed in this basis,',
      },
      {
        kind: 'eq',
        latex: String.raw`\left|p(t)\right\rangle = \sum_{\mathbf{n}} p(\mathbf{n}, t)\left|\mathbf{n}\right\rangle .`,
      },
      {
        kind: 'p',
        text: 'Two operators connect neighboring basis states. The annihilation operator $a$ removes one molecule and multiplies by $n$, reflecting the $n$ indistinguishable molecules that could be removed. The creation operator $a^{\\dagger}$ adds one molecule and carries no numerical prefactor,',
      },
      {
        kind: 'eq',
        latex: String.raw`a\left|n\right\rangle = n\left|n-1\right\rangle , \qquad a^\dagger\left|n\right\rangle = \left|n+1\right\rangle , \qquad \hat{n}=a^\dagger a .`,
      },
      {
        kind: 'p',
        text: 'Combinatorial factors therefore arise automatically. A step that consumes two molecules of the same species acquires the factor $n(n-1)$ directly from the operator algebra, with no binomial coefficient introduced by hand,',
      },
      {
        kind: 'eq',
        latex: String.raw`a^2\left|n\right\rangle = n(n-1)\left|n-2\right\rangle .`,
      },
      {
        kind: 'p',
        text: 'A caveat on notation is warranted. The dagger is an algebraic label rather than a Hermitian adjoint. The Doi-Peliti construction borrows the symbols of second quantization, but the evolved object is a classical probability distribution, and the inner product of quantum mechanics does not apply.',
      },
      {
        kind: 'p',
        text: 'The builder below assembles elementary steps and displays each reaction as a balanced equation together with its generated operator term; hovering over an operator reveals the truncated matrix it represents. The preset loads the reversible Schlogl model, a standard test case for stochastic bistability and switching.',
      },
      { kind: 'widget', widget: 'builder' },
      { kind: 'widget', widget: 'liveOperator' },
    ],
  },
  {
    id: 'construction',
    title: 'How a reaction becomes an operator',
    body: [
      {
        kind: 'p',
        text: 'The operator terms generated by the builder follow a fixed structure: each elementary reaction contributes a rate constant multiplying a gain term minus a loss term. The origin of this structure is clearest for the simplest reaction. (The builder denotes the annihilation and creation operators of species $X$ by $x_X$ and $x_X^{\\dagger}$, the species-labeled counterparts of $a$ and $a^{\\dagger}$.) Consider the unimolecular decay $A\\to\\varnothing$ with rate constant $k$,',
      },
      {
        kind: 'eq',
        latex: String.raw`\hat{H}_{A\to\varnothing} = k\left(a - a^\dagger a\right) .`,
      },
      {
        kind: 'p',
        text: 'The gain term $a$ removes one molecule, transferring probability from each state to the state with one fewer molecule. The loss term $a^{\\dagger}a$ is the number operator, with $a^{\\dagger}a\\left|n\\right\\rangle = n\\left|n\\right\\rangle$ counting the molecules available to decay while leaving the configuration unchanged; the minus sign removes the corresponding probability from the originating state. Probability leaves each state at exactly the rate at which it accumulates elsewhere, which is the statement of conservation.',
      },
      {
        kind: 'p',
        text: 'The bimolecular reaction $2A\\to B$ introduces the essential additional feature,',
      },
      {
        kind: 'eq',
        latex: String.raw`\hat{H}_{2A\to B} = k\left(b^\dagger a^2 - a^{\dagger 2} a^2\right) .`,
      },
      {
        kind: 'p',
        text: 'That feature is the pair annihilation $a^2$. Since $a^2\\left|n\\right\\rangle = n(n-1)\\left|n-2\\right\\rangle$, the operator already encodes the number of ordered pairs of reacting molecules. The gain term $b^{\\dagger}a^2$ removes two molecules of $A$ and creates one of $B$, while the loss term $a^{\\dagger 2}a^2$ counts the same pairs and restores them. The combinatorial factor is supplied by the annihilation operators rather than inserted separately.',
      },
      {
        kind: 'p',
        text: 'The forward Schlogl step, $2X + A \\to 3X$, follows the same construction with additional species. Factoring out the annihilation of the reactants exposes the structure,',
      },
      {
        kind: 'eq',
        latex: String.raw`\mathbb{W}_{1,f} = \frac{c_1}{2}\left(x_X^{\dagger 3} - x_X^{\dagger 2}\, x_A^{\dagger}\right) x_X^{2}\, x_A .`,
      },
      {
        kind: 'p',
        text: 'Reading from right to left, the factor $x_X^{2}\\, x_A$ annihilates the reactants and supplies the $\\tfrac{1}{2}n(n-1)$ ordered pairs of identical $X$, with the prefactor $\\tfrac{1}{2}$ correcting for their ordering. The bracketed term then either creates the three product molecules of $X$, which is the gain, or restores the two $X$ and one $A$ that were consumed, which is the loss. Their difference is the net change in configuration, and the minus sign enforces probability conservation. For a general reaction with reactant stoichiometry $\\eta_i$, product stoichiometry $\\mu_i$, and rate constant $k$, the operator is',
      },
      {
        kind: 'eq',
        latex: String.raw`\hat{H} = k\left(\prod_i \left(a_i^\dagger\right)^{\mu_i} - \prod_i \left(a_i^\dagger\right)^{\eta_i}\right)\prod_i a_i^{\eta_i} .`,
      },
      {
        kind: 'p',
        text: 'The reverse step follows the same construction applied to the reversed reaction $3X \\to 2X + A$; its operator $\\mathbb{W}_{1,r}$ therefore exchanges the roles of products and reactants and carries a prefactor $c_2/3! = c_2/6$ for the three identical $X$. In the builder, reversing the reaction direction interchanges the two operators, and modifying the stoichiometry updates the operator exponents and combinatorial prefactors accordingly.',
      },
    ],
  },
  {
    id: 'generator',
    title: 'Building the generator',
    body: [
      {
        kind: 'p',
        text: 'A reaction mechanism comprises several elementary reactions, and its generator $\\hat{H}$ is the sum of the operator terms of the individual steps, so the mechanism assembled in the builder corresponds to a single matrix. Because each term is constructed as gain minus loss, the sum conserves total probability, and $\\hat{H}$ is a bona fide generator of a stochastic process.',
      },
      {
        kind: 'p',
        text: 'This generator specifies the full dynamics. The distribution evolves under a single linear equation whose formal solution is a matrix exponential, so that the entire time evolution is determined by $\\hat{H}$ and the initial condition,',
      },
      {
        kind: 'eq',
        latex: String.raw`\frac{d}{dt}\left|p(t)\right\rangle = \hat{H}\left|p(t)\right\rangle , \qquad \left|p(t)\right\rangle = e^{t\hat{H}}\left|p(0)\right\rangle .`,
      },
      {
        kind: 'p',
        text: 'Constructing $\\hat{H}$ is straightforward; the difficulty lies in applying $e^{t\\hat{H}}$, since $\\left|p(t)\\right\\rangle$ carries one entry for every accessible configuration and the dimension of this space grows exponentially with system size. Tensor networks provide a controlled approximation for this evolution, for which the natural first step is a diagrammatic representation of the operators.',
      },
    ],
  },
  {
    id: 'diagrams',
    title: 'Reading the operators as tensor diagrams',
    body: [
      {
        kind: 'p',
        text: 'Operators constructed from $a$ and $a^{\\dagger}$ are tensors, and tensor diagram notation provides a compact representation of them. In this notation a tensor is drawn as a shaded shape, and each index is a line emanating from it. The number of lines is the order of the tensor, and the number of values an index can take is its dimension; a matrix, for example, is an order-2 tensor with one incoming and one outgoing line.',
      },
      { kind: 'widget', widget: 'factorFig' },
      {
        kind: 'p',
        text: 'Connecting two lines denotes a contraction, that is, a summation over the shared index. A line joining two shapes is an internal index of the resulting network, and a line left uncontracted is an external index. The order of the tensor computed by a diagram equals the number of external lines, so a diagram with no uncontracted indices evaluates to a scalar.',
      },
      { kind: 'widget', widget: 'contractionFig' },
      {
        kind: 'p',
        text: 'These two rules, shapes with indices and contractions as summations, suffice to represent the operators introduced above and, in the following section, the full state and generator.',
      },
    ],
  },
  {
    id: 'networks',
    title: 'From operators to tensor networks',
    body: [
      {
        kind: 'p',
        text: 'A single well-mixed species can be treated directly. The tensor-network representation becomes valuable for spatially extended systems, modeled as a chain of small volumes, or voxels, in which molecules react locally and hop between neighboring voxels. Each voxel carries its own occupation number, so a chain of $L$ voxels supports a distribution over $d^{L}$ configurations once the occupation of each voxel is truncated at $d$ values. Storing this distribution explicitly is intractable for all but the shortest chains.',
      },
      {
        kind: 'p',
        text: 'A Matrix Product State circumvents explicit storage. The distribution is expressed as a chain of factor tensors, one per voxel, each carrying a vertical external index for its local occupation and horizontal internal indices connecting it to its neighbors,',
      },
      {
        kind: 'eq',
        latex: String.raw`\left|p(t)\right\rangle \approx \sum_{n_1,\ldots,n_L} A^{[1]n_1}A^{[2]n_2}\cdots A^{[L]n_L}\left|n_1,\ldots,n_L\right\rangle .`,
      },
      { kind: 'widget', widget: 'mpsFig' },
      {
        kind: 'p',
        text: 'The dimension of these internal bonds, denoted $\\chi$, controls the amount of correlation between voxels that the representation can capture. It is the rank of the factorization across each bipartition of the chain, and increasing it improves accuracy at the cost of memory.',
      },
      {
        kind: 'p',
        text: 'The generator admits the same structure. Because the Doi-Peliti operators are composed of local reaction and hopping terms, $\\hat{H}$ can be written as a Matrix Product Operator, a chain of factor tensors each carrying an upper and a lower external index.',
      },
      { kind: 'widget', widget: 'mpoFig' },
      {
        kind: 'p',
        text: 'Time evolution then proceeds by contracting the operator network with the state network and compressing the result to a prescribed bond dimension[[c:7]]. The controls below compare the number of parameters in the tensor-network representation with the size of the full distribution as the chain length increases.',
      },
      { kind: 'widget', widget: 'interactiveChain' },
    ],
  },
  {
    id: 'rare-events',
    title: 'Application: rare events on a reaction-diffusion chain',
    body: [
      {
        kind: 'p',
        text: 'A representative application is the estimation of rare transition rates, such as the switching of a spatially extended bistable system between its two stable states. Direct simulation is inefficient in this setting, because the transition occurs infrequently and the configuration space is too large to enumerate. In the operator formulation the rate is expressed as a ratio of contractions: the distribution is projected onto the initial basin, evolved under the generator, and projected onto the target basin, and the rate is read off from the growth of the projected probability once short-time transients have decayed.',
      },
      {
        kind: 'p',
        text: 'This procedure has been implemented for a reaction-diffusion chain by representing the distribution as a Matrix Product State and the generator as a Matrix Product Operator, and propagating the compressed state with the time-dependent variational principle[[c:6]]. The compression renders the extended chain tractable, while the operator representation preserves the exact accounting of probability flow, yielding the switching rate without a prescribed reaction coordinate.',
      },
      {
        kind: 'p',
        text: 'A closely related approach applies the density-matrix renormalization group to survey the rate constants of a well-mixed network, constructing the joint distribution over correlated copy numbers as a tensor network and tracking its variation across parameter space[[c:5]]. The operator construction described here provides precisely the input required by such methods.',
      },
      {
        kind: 'p',
        text: 'The overall framework is modular: the Doi-Peliti construction supplies the local operator structure, tensor diagram notation makes that structure explicit, and the Matrix Product State and Operator provide the compression that extends the same formulation to systems well beyond the reach of direct enumeration.',
      },
    ],
  },
]

export const REFERENCES: Reference[] = [
  {
    n: 1,
    text: 'M. Doi, "Second Quantization Representation for Classical Many-Particle Systems," Journal of Physics A: Mathematical and General 9, 1465 (1976).',
    href: 'https://doi.org/10.1088/0305-4470/9/9/008',
    hrefLabel: 'doi:10.1088/0305-4470/9/9/008',
  },
  {
    n: 2,
    text: 'L. Peliti, "Path Integral Approach to Birth-Death Processes on a Lattice," Journal de Physique 46, 1469 (1985).',
    href: 'https://doi.org/10.1051/jphys:019850046090146900',
    hrefLabel: 'doi:10.1051/jphys:019850046090146900',
  },
  {
    n: 3,
    text: 'N. G. van Kampen, Stochastic Processes in Physics and Chemistry, 3rd ed. (North-Holland, 2007).',
  },
  {
    n: 4,
    text: 'D. T. Gillespie, "Exact Stochastic Simulation of Coupled Chemical Reactions," Journal of Physical Chemistry 81, 2340 (1977).',
    href: 'https://doi.org/10.1021/j100540a008',
    hrefLabel: 'doi:10.1021/j100540a008',
  },
  {
    n: 5,
    text: 'J. P. Zima, S. B. Nicholson, and T. R. Gingrich, "Chemical master equation parameter exploration using DMRG," Journal of Chemical Physics 163, 054118 (2025).',
    href: 'https://arxiv.org/abs/2501.09692',
    hrefLabel: 'arXiv:2501.09692',
  },
  {
    n: 6,
    text: 'S. B. Nicholson and T. R. Gingrich, "Quantifying Rare Events in Stochastic Reaction-Diffusion Dynamics Using Tensor Networks," Physical Review X 13, 041006 (2023).',
    href: 'https://doi.org/10.1103/PhysRevX.13.041006',
    hrefLabel: 'doi:10.1103/PhysRevX.13.041006',
  },
  {
    n: 7,
    text: 'U. Schollwock, "The Density-Matrix Renormalization Group in the Age of Matrix Product States," Annals of Physics 326, 96 (2011).',
    href: 'https://doi.org/10.1016/j.aop.2010.09.012',
    hrefLabel: 'doi:10.1016/j.aop.2010.09.012',
  },
]
