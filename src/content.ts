import type { RawElementaryStep } from './utils'

//
// Content model for the article. A section is an ordered list of blocks so that
// display equations sit inline, between the paragraphs that motivate them, the
// way a TensorNetwork.org page reads.
//

/** Interactive widgets and diagrams the page can drop into a section. */
export type SectionWidget =
  | 'builder'
  | 'interactiveChain'
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

// Seven-species gene toggle switch (14 elementary reactions), following the
// mass-action construction used by Zima, Nicholson, and Gingrich (arXiv:2501.09692).
// Species: A, A2 (dimer), B, B2 (dimer), O (free operator), OA2, OB2 (bound operators).
export const GTS_PRESET: Omit<RawElementaryStep, 'id'>[] = [
  // dimerization
  { reactants: '2A', products: 'A2', type: 'equilibrium', forwardRate: 'c_1', reverseRate: 'c_2' },
  { reactants: '2B', products: 'B2', type: 'equilibrium', forwardRate: 'c_3', reverseRate: 'c_4' },
  // operator binding
  { reactants: 'O + A2', products: 'OA2', type: 'equilibrium', forwardRate: 'c_5', reverseRate: 'c_6' },
  { reactants: 'O + B2', products: 'OB2', type: 'equilibrium', forwardRate: 'c_7', reverseRate: 'c_8' },
  // synthesis
  { reactants: 'O', products: 'O + A', type: 'forward', forwardRate: 'c_9', reverseRate: '' },
  { reactants: 'O', products: 'O + B', type: 'forward', forwardRate: 'c_{10}', reverseRate: '' },
  { reactants: 'OA2', products: 'OA2 + A', type: 'forward', forwardRate: 'c_{11}', reverseRate: '' },
  { reactants: 'OB2', products: 'OB2 + B', type: 'forward', forwardRate: 'c_{12}', reverseRate: '' },
  // degradation
  { reactants: 'A', products: '', type: 'forward', forwardRate: 'c_{13}', reverseRate: '' },
  { reactants: 'B', products: '', type: 'forward', forwardRate: 'c_{14}', reverseRate: '' },
]

export const PAGE = {
  title: 'Applications of Tensor Networks to Stochastic Chemical Kinetics',
  synopsis: [
    'Stochastic chemical kinetics describes a reaction network by a probability distribution over the integer copy numbers of its species, evolving under a master equation. The occupation-number representation expresses that master equation as a single linear operator acting on the vector of configuration probabilities[[c:1,2,3,4]]. Working in terms of integer molecule counts rather than continuous concentrations casts each reaction as a product of creation and annihilation operators, and the combinatorial factors associated with indistinguishable reactants arise directly from the action of those operators.',
    'This operator representation is also the natural point of departure for tensor-network methods. The probability vector is represented as a [Matrix Product State](https://tensornetwork.org/mps/) and the generator as a [Matrix Product Operator](https://tensornetwork.org/mpo/), so that a state space that grows exponentially with the size of the system can be stored and propagated within a controllable memory budget[[c:5]]. The builder below assembles a reaction mechanism and displays its operator form and tensor diagrams; no quantum mechanics is needed to follow them.',
  ],
}

export const ARTICLE_SECTIONS: ArticleSection[] = [
  {
    id: 'counting',
    title: 'Why count molecules instead of concentrations',
    body: [
      {
        kind: 'p',
        text: 'Deterministic chemical kinetics tracks concentrations through coupled ordinary differential equations, a description that is accurate when every species is present in large numbers and its concentration is effectively continuous. That description fails when a species is present in only tens or hundreds of copies, as is common for gene products, intracellular signaling molecules, and reactions confined to small volumes[[c:6]]. In this regime the copy number of each species is a discrete integer that changes by a whole number of molecules at each reaction event, and the timing of those events is a random process.',
      },
      {
        kind: 'p',
        text: 'The appropriate description is then a probability distribution over integer copy numbers. Writing $\\mathbf{n}$ for the vector of copy numbers of each species, $p(\\mathbf{n}, t)$ denotes the probability of configuration $\\mathbf{n}$ at time $t$, and its evolution obeys the chemical master equation[[c:7]], a linear rate equation with one term per reaction. The master equation is readily written but difficult to solve, since the number of accessible configurations grows combinatorially with the number of species[[c:8]].',
      },
      {
        kind: 'p',
        text: 'The occupation-number representation does not alter the underlying physics. It re-expresses the same master equation in an operator language that exposes its algebraic structure and, in particular, renders it amenable to tensor-network representation.',
      },
      {
        kind: 'p',
        text: 'The operator representation used here was introduced independently by Doi[[c:1,2]], by Zel\'dovich and Ovchinnikov[[c:3]], and by Grassberger and Scheunert[[c:4]]. The name Doi-Peliti properly refers to the coherent-state path integral built on this representation[[c:9,10]], which this page does not use; the construction below stays at the operator level.',
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
        text: 'Combinatorial factors therefore arise automatically. A step that consumes two molecules of the same species acquires the factor $n(n-1)$ directly from the action of those operators, with no binomial coefficient introduced by hand,',
      },
      {
        kind: 'eq',
        latex: String.raw`a^2\left|n\right\rangle = n(n-1)\left|n-2\right\rangle .`,
      },
      {
        kind: 'p',
        text: 'A caveat on notation is warranted. The dagger is an algebraic label rather than a Hermitian conjugate: the construction borrows the symbols of second quantization, but the evolved object is a classical probability distribution, normalized so that its entries sum to one (the 1-norm) rather than so that their squares do (the 2-norm of a wave function).',
      },
      {
        kind: 'p',
        text: 'The builder below assembles elementary steps and displays each reaction as a balanced equation together with its generated operator term; hovering over an operator reveals the truncated matrix it represents. Load a preset with the two buttons, the reversible Schlögl model or a seven-species gene toggle switch, or clear the mechanism and build your own.',
      },
      { kind: 'widget', widget: 'builder' },
    ],
  },
  {
    id: 'flat-state',
    title: 'The flat state and observables',
    body: [
      {
        kind: 'p',
        text: 'Probabilities are read out of the state by a single fixed covector, the flat state (or sum state),',
      },
      {
        kind: 'eq',
        latex: String.raw`\langle 1| = \sum_{\mathbf{n}} \langle \mathbf{n}| .`,
      },
      {
        kind: 'p',
        text: 'Its defining property is that creation is invisible to it,',
      },
      {
        kind: 'eq',
        latex: String.raw`\langle 1|\, a^{\dagger} = \langle 1| ,`,
      },
      {
        kind: 'p',
        text: 'because $\\langle 1|a^{\\dagger}|n\\rangle = \\langle 1|n+1\\rangle = 1 = \\langle 1|n\\rangle$ for every $n$. Pairing the flat state with the probability vector returns total probability, which is the normalization condition,',
      },
      {
        kind: 'eq',
        latex: String.raw`\langle 1 | p(t)\rangle = \sum_{\mathbf{n}} p(\mathbf{n},t) = 1 .`,
      },
      {
        kind: 'p',
        text: 'Averages are pairings as well: for an observable that is a function of the copy numbers, represented by a diagonal operator $\\hat{A}$, the expectation value is',
      },
      {
        kind: 'eq',
        latex: String.raw`\langle A \rangle_t = \langle 1|\, \hat{A}\, \left|p(t)\right\rangle ,`,
      },
      {
        kind: 'p',
        text: 'so the mean copy number of species $i$ is $\\langle \\hat{n}_i\\rangle = \\langle 1|\\hat{n}_i|p(t)\\rangle$. This is the practical contrast with quantum mechanics, where an expectation value is a state paired with itself, $\\langle \\psi|\\hat{A}|\\psi\\rangle$; here the state is always paired with the same fixed dual vector $\\langle 1|$. The identity $\\langle 1|a^{\\dagger}=\\langle 1|$ is what makes probability conservation a one-line result once the generator is assembled below.',
      },
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
        latex: String.raw`\mathbb{W}_{A\to\varnothing} = k\left(a - a^\dagger a\right) .`,
      },
      {
        kind: 'p',
        text: 'The gain term $a$ removes one molecule, transferring probability from each state to the state with one fewer molecule. The loss term $a^{\\dagger}a$ is the number operator, with $a^{\\dagger}a\\left|n\\right\\rangle = n\\left|n\\right\\rangle$ counting the molecules available to decay while leaving the configuration unchanged; the minus sign removes the corresponding probability from the originating state, so probability leaves each state at exactly the rate it accumulates elsewhere.',
      },
      {
        kind: 'p',
        text: 'The bimolecular reaction $2A\\to B$ has the operator',
      },
      {
        kind: 'eq',
        latex: String.raw`\mathbb{W}_{2A\to B} = k\left(b^\dagger a^2 - a^{\dagger 2} a^2\right) .`,
      },
      {
        kind: 'p',
        text: 'Its new element is the pair annihilation $a^2$. Since $a^2\\left|n\\right\\rangle = n(n-1)\\left|n-2\\right\\rangle$, the operator already encodes the number of ordered pairs of reacting molecules. The gain term $b^{\\dagger}a^2$ removes two molecules of $A$ and creates one of $B$, while the loss term $a^{\\dagger 2}a^2$ counts the same pairs and restores them. The combinatorial factor is supplied by the annihilation operators rather than inserted separately.',
      },
      {
        kind: 'p',
        text: 'The forward Schlögl step, $2X + A \\to 3X$, follows the same construction with additional species. Factoring out the annihilation of the reactants exposes the structure,',
      },
      {
        kind: 'eq',
        latex: String.raw`\mathbb{W}_{1,f} = \frac{c_1}{2}\left(x_X^{\dagger 3} - x_X^{\dagger 2}\, x_A^{\dagger}\right) x_X^{2}\, x_A .`,
      },
      {
        kind: 'p',
        text: 'Reading from right to left, the factor $x_X^{2}\\, x_A$ annihilates the reactants and supplies the $\\tfrac{1}{2}n_X(n_X-1)\\,n_A$ ways of selecting the two identical $X$ and one $A$, with the prefactor $\\tfrac{1}{2}$ correcting for the ordering of the two $X$. The bracketed term then either creates the three product molecules of $X$, which is the gain, or restores the two $X$ and one $A$ that were consumed, which is the loss. Their difference is the net change in configuration, and the minus sign enforces probability conservation. For a general reaction with reactant stoichiometry $\\eta_i$, product stoichiometry $\\mu_i$, and rate constant $k$, the operator is',
      },
      {
        kind: 'eq',
        latex: String.raw`\mathbb{W} = k\left(\prod_i \left(a_i^\dagger\right)^{\mu_i} - \prod_i \left(a_i^\dagger\right)^{\eta_i}\right)\prod_i a_i^{\eta_i} .`,
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
        text: 'A reaction mechanism comprises several elementary reactions, and its generator $\\mathbb{W}$ is the sum of the operator terms of the individual steps, so the mechanism assembled in the builder corresponds to a single matrix.',
      },
      {
        kind: 'p',
        text: 'The distribution evolves under a single linear equation, with no minus sign and no factor of $i$, in contrast to the Schrödinger equation,',
      },
      {
        kind: 'eq',
        latex: String.raw`\frac{d}{dt}\left|p(t)\right\rangle = \mathbb{W}\left|p(t)\right\rangle .`,
      },
      {
        kind: 'p',
        text: 'The spectrum of $\\mathbb{W}$ lies in the left half-plane, its eigenvalues having nonpositive real part, so the evolution relaxes the distribution toward its stationary state. Total probability is conserved for any mechanism, and the flat state makes this a one-line result. Applying $\\langle 1|$ to the general term above, every product of creation operators acts as the identity from the left, since $\\langle 1|a_i^{\\dagger} = \\langle 1|$, so the gain and loss brackets cancel and',
      },
      {
        kind: 'eq',
        latex: String.raw`\langle 1|\,\mathbb{W} = 0 \qquad\Longrightarrow\qquad \frac{d}{dt}\langle 1 | p(t)\rangle = \langle 1|\,\mathbb{W}\left|p(t)\right\rangle = 0 .`,
      },
      {
        kind: 'p',
        text: 'The formal solution of this equation is a matrix exponential, so the entire time evolution is fixed by the generator and the initial condition, $\\left|p(t)\\right\\rangle = e^{t\\mathbb{W}}\\left|p(0)\\right\\rangle$. Constructing $\\mathbb{W}$ is straightforward; the difficulty lies in applying $e^{t\\mathbb{W}}$, since $\\left|p(t)\\right\\rangle$ carries one entry for every accessible configuration and the dimension of this space grows exponentially with system size. Tensor networks provide a controlled approximation for this evolution.',
      },
    ],
  },
  {
    id: 'diagrams',
    title: 'Tensor diagrams',
    body: [
      {
        kind: 'p',
        text: 'Operators built from $a$ and $a^{\\dagger}$ are [tensors](https://tensornetwork.org/tensor/), and this page draws them in [tensor diagram notation](https://tensornetwork.org/diagrams/): a tensor is a shape, each line is an index, and joining two lines denotes a contraction, a summation over the shared index. That page is the reference for the notation itself, including the terms order, dimension, and rank used below.',
      },
      {
        kind: 'p',
        text: 'Two features are specific to the present setting. The tensors here generate a stochastic process rather than a Hermitian observable, so a diagram is generally not symmetric under exchanging its upper and lower legs. And each external index is an occupation number, whose dimension is the number of retained states per site, while the flat state $\\langle 1|$ is a specific covector that closes a diagram to return a probability or an average.',
      },
    ],
  },
  {
    id: 'networks',
    title: 'From operators to tensor networks',
    body: [
      {
        kind: 'p',
        text: 'A single well-mixed species can be treated directly. The tensor-network representation becomes valuable when the distribution is high-dimensional, whether because the network contains many chemical species whose copy numbers are correlated or because a spatially extended system is resolved into a chain of small volumes, or voxels[[c:6]]. In either case the degrees of freedom form a chain of sites, one per species or per voxel, each carrying its own occupation number.',
      },
      {
        kind: 'p',
        text: 'Truncating each site at a maximum occupation $n \\le d$ retains $d+1$ states per site, so a chain of $L$ sites supports $(d+1)^{L}$ configurations. Storing this distribution explicitly is intractable for all but the smallest systems.',
      },
      {
        kind: 'p',
        text: 'A Matrix Product State circumvents explicit storage. The distribution is expressed as a chain of factor tensors, one per site, each carrying a vertical external index for its local occupation and horizontal internal indices connecting it to its neighbors,',
      },
      {
        kind: 'eq',
        latex: String.raw`\left|p(t)\right\rangle \approx \sum_{n_1,\ldots,n_L} A^{[1]n_1}A^{[2]n_2}\cdots A^{[L]n_L}\left|n_1,\ldots,n_L\right\rangle .`,
      },
      { kind: 'widget', widget: 'mpsFig' },
      {
        kind: 'p',
        text: 'The dimension of these internal bonds, denoted $\\chi$, is the rank of the factorization across each bipartition of the chain, and increasing it improves accuracy at the cost of memory.',
      },
      {
        kind: 'p',
        text: 'Across a given cut, $\\chi = 1$ means the distribution factorizes into independent halves, so $\\chi$ is a direct measure of the correlation the representation retains between the two sides. Because the factor tensors may carry negative entries, $\\chi$ can fall well below the bond dimension a nonnegative representation would require[[c:11]]; those same negative entries are why compression in the 2-norm can leave small negative probabilities.',
      },
      {
        kind: 'p',
        text: 'The generator admits the same structure. Because each operator term couples only a few sites, $\\mathbb{W}$ can be written as a Matrix Product Operator, a chain of factor tensors each carrying an upper external index $n_i$ and a lower external index $n_i^{\\prime}$.',
      },
      { kind: 'widget', widget: 'mpoFig' },
      {
        kind: 'p',
        text: 'Time evolution then proceeds by contracting the operator network with the state network and compressing the result to a prescribed bond dimension[[c:5]]. The controls below compare the number of parameters in the tensor-network representation with the size of the full distribution as the chain length increases.',
      },
      {
        kind: 'p',
        text: 'Truncation is not free. On a truncated site the identity $\\langle 1|a^{\\dagger} = \\langle 1|$ acquires a boundary term, because creation from the top retained state leaves the space, so a naive hard cut-off leaks probability and $\\langle 1|\\mathbb{W} \\ne 0$ exactly. There are two honest responses. The pragmatic one is to choose $d$ generously, so that the distribution carries negligible weight near the cap, and to monitor $\\langle 1|p\\rangle$ over time as a diagnostic. The principled one is to zero the rate of every reaction step that would carry a configuration past the cap, removing that step\'s gain and loss together; this restores exact conservation on the finite space, at the price of a boundary term in the commutation relations of the truncated operators[[c:12]].',
      },
      { kind: 'widget', widget: 'interactiveChain' },
      {
        kind: 'p',
        text: 'On a short chain the Matrix Product State parameter count can exceed the size of the full distribution. This is the crossover, not a defect: the tensor network saves memory only once the chain is long enough that $(d+1)^{L}$ outgrows the parameter count, which grows only linearly in $L$. Lengthening the chain with the first slider makes the saving appear.',
      },
    ],
  },
  {
    id: 'rare-events',
    title: 'Rare events and rate-constant exploration',
    body: [
      {
        kind: 'p',
        text: 'A representative application is the estimation of rare transition rates, such as the switching of a spatially extended bistable system between its two stable states. Direct simulation is inefficient in this setting, because the transition occurs infrequently and the configuration space is too large to enumerate. In the operator formulation the rate is expressed as a ratio of contractions: the distribution is projected onto the initial basin, evolved under the generator, and projected onto the target basin, and the rate is read off from the growth of the projected probability once short-time transients have decayed.',
      },
      {
        kind: 'p',
        text: 'This procedure has been implemented for a reaction-diffusion chain by representing the distribution as a Matrix Product State and the generator as a Matrix Product Operator, and propagating the compressed state with the time-dependent variational principle[[c:12]], which yields the switching rate without a prescribed reaction coordinate.',
      },
      {
        kind: 'p',
        text: 'A closely related approach applies the [density-matrix renormalization group](https://tensornetwork.org/mps/algorithms/dmrg/) to survey the rate constants of a well-mixed network, constructing the joint distribution over correlated copy numbers as a tensor network and tracking its variation across parameter space[[c:13]].',
      },
      {
        kind: 'p',
        text: 'The same operator-to-tensor-network route has been pursued in many groups, from tensor-train solvers for the chemical master equation[[c:14,15]] to matrix-product-state methods for driven and large-deviation dynamics[[c:16]] and broader treatments of stochastic mechanics[[c:17]].',
      },
      {
        kind: 'p',
        text: 'The overall framework is modular: the occupation-number construction supplies the local operator structure, tensor diagram notation makes that structure explicit, and the Matrix Product State and Operator provide the compression that extends the same formulation to systems well beyond the reach of direct enumeration.',
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
    text: 'M. Doi, "Stochastic theory of diffusion-controlled reaction," Journal of Physics A: Mathematical and General 9, 1479-1495 (1976).',
    href: 'https://doi.org/10.1088/0305-4470/9/9/009',
    hrefLabel: 'doi:10.1088/0305-4470/9/9/009',
  },
  {
    n: 3,
    text: 'Ya. B. Zel\'dovich and A. A. Ovchinnikov, "The mass action law and the kinetics of chemical reactions with allowance for thermodynamic fluctuations of the density," Soviet Physics JETP 47, 829 (1978).',
  },
  {
    n: 4,
    text: 'P. Grassberger and M. Scheunert, "Fock-Space Methods for Identical Classical Objects," Fortschritte der Physik 28, 547 (1980).',
    href: 'https://doi.org/10.1002/prop.19800281004',
    hrefLabel: 'doi:10.1002/prop.19800281004',
  },
  {
    n: 5,
    text: 'U. Schollwöck, "The Density-Matrix Renormalization Group in the Age of Matrix Product States," Annals of Physics 326, 96 (2011).',
    href: 'https://doi.org/10.1016/j.aop.2010.09.012',
    hrefLabel: 'doi:10.1016/j.aop.2010.09.012',
  },
  {
    n: 6,
    text: 'R. Erban and S. J. Chapman, Stochastic Modelling of Reaction-Diffusion Processes (Cambridge University Press, 2020).',
    href: 'https://www.cambridge.org/9781108498128',
    hrefLabel: 'Cambridge University Press',
  },
  {
    n: 7,
    text: 'N. G. van Kampen, Stochastic Processes in Physics and Chemistry, 3rd ed. (North-Holland, 2007).',
  },
  {
    n: 8,
    text: 'D. T. Gillespie, "Exact Stochastic Simulation of Coupled Chemical Reactions," Journal of Physical Chemistry 81, 2340 (1977).',
    href: 'https://doi.org/10.1021/j100540a008',
    hrefLabel: 'doi:10.1021/j100540a008',
  },
  {
    n: 9,
    text: 'L. Peliti, "Path Integral Approach to Birth-Death Processes on a Lattice," Journal de Physique 46, 1469 (1985).',
    href: 'https://doi.org/10.1051/jphys:019850046090146900',
    hrefLabel: 'doi:10.1051/jphys:019850046090146900',
  },
  {
    n: 10,
    text: 'U. C. Täuber, M. Howard, and B. P. Vollmayr-Lee, "Applications of field-theoretic renormalization group methods to reaction-diffusion problems," Journal of Physics A: Mathematical and General 38, R79 (2005).',
    href: 'https://doi.org/10.1088/0305-4470/38/17/R01',
    hrefLabel: 'doi:10.1088/0305-4470/38/17/R01',
  },
  {
    n: 11,
    text: 'I. Glasser, R. Sweke, N. Pancotti, J. Eisert, and J. I. Cirac, "Expressive power of tensor-network factorizations for probabilistic modeling," Advances in Neural Information Processing Systems 32 (2019).',
    href: 'https://arxiv.org/abs/1907.03741',
    hrefLabel: 'arXiv:1907.03741',
  },
  {
    n: 12,
    text: 'S. B. Nicholson and T. R. Gingrich, "Quantifying Rare Events in Stochastic Reaction-Diffusion Dynamics Using Tensor Networks," Physical Review X 13, 041006 (2023).',
    href: 'https://doi.org/10.1103/PhysRevX.13.041006',
    hrefLabel: 'doi:10.1103/PhysRevX.13.041006',
  },
  {
    n: 13,
    text: 'J. P. Zima, S. B. Nicholson, and T. R. Gingrich, "Chemical master equation parameter exploration using DMRG," Journal of Chemical Physics 163, 054118 (2025).',
    href: 'https://doi.org/10.1063/5.0276591',
    hrefLabel: 'doi:10.1063/5.0276591',
  },
  {
    n: 14,
    text: 'V. Kazeev, M. Khammash, M. Nip, and C. Schwab, "Direct Solution of the Chemical Master Equation Using Quantized Tensor Trains," PLoS Computational Biology 10, e1003359 (2014).',
    href: 'https://doi.org/10.1371/journal.pcbi.1003359',
    hrefLabel: 'doi:10.1371/journal.pcbi.1003359',
  },
  {
    n: 15,
    text: 'P. Gelß, S. Matera, and C. Schütte, "Solving the master equation without kinetic Monte Carlo: Tensor train approximations for a CO oxidation model," Journal of Computational Physics 314, 489 (2016).',
    href: 'https://doi.org/10.1016/j.jcp.2016.03.025',
    hrefLabel: 'doi:10.1016/j.jcp.2016.03.025',
  },
  {
    n: 16,
    text: 'M. C. Bañuls and J. P. Garrahan, "Using Matrix Product States to Study the Dynamical Large Deviations of Kinetically Constrained Models," Physical Review Letters 123, 200601 (2019).',
    href: 'https://doi.org/10.1103/PhysRevLett.123.200601',
    hrefLabel: 'doi:10.1103/PhysRevLett.123.200601',
  },
  {
    n: 17,
    text: 'J. C. Baez and J. Biamonte, Quantum Techniques for Stochastic Mechanics (World Scientific, 2018).',
    href: 'https://doi.org/10.1142/10623',
    hrefLabel: 'doi:10.1142/10623',
  },
]
