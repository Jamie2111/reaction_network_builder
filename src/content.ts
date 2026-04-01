import type { RawElementaryStep } from './utils'

export interface PedagogyEquation {
  label?: string
  latex: string
}

export interface PedagogySection {
  id: string
  title: string
  summary: string
  paragraphs: string[]
  equations?: PedagogyEquation[]
  bullets?: string[]
}

export interface FullPaperSection {
  id: string
  title: string
  paragraphs: string[]
  equations?: PedagogyEquation[]
  bullets?: string[]
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

export const PAPER_DETAILS = {
  title: 'Quantifying Rare Events in Stochastic Reaction-Diffusion Dynamics Using Tensor Networks',
  authors: 'Schuyler B. Nicholson and Todd R. Gingrich',
  journal: 'Physical Review X 13, 041006 (2023)',
  doi: '10.1103/PhysRevX.13.041006',
}

export const PAPER_SECTIONS: PedagogySection[] = [
  {
    id: 'how-to-use',
    title: 'How To Use This Page',
    summary: 'Start from the paper model, inspect the operator form, and use the notes below as a reading companion.',
    paragraphs: [
      'This site now works as both a reaction-mechanism builder and a guided Doi-Peliti explainer. The quickest path into the Nicholson-Gingrich paper is to load the Schlogl preset, inspect the reversible steps, and then compare the generated operator expressions with the notes below.',
    ],
    bullets: [
      'Load the Schlogl preset to reproduce the paper\'s two reversible reaction families.',
      'Use the reaction builder to edit stoichiometry or rates and watch the second-quantized form update immediately.',
      'Hover the operator symbols in the generated expressions to see the truncated matrix representation used by the interface.',
    ],
  },
  {
    id: 'why-doi-peliti',
    title: 'Why Stochastic Modeling And Why Doi-Peliti',
    summary: 'At small copy number, chemistry is about fluctuating probabilities rather than deterministic concentrations.',
    paragraphs: [
      'Ordinary differential equations track average concentrations. That viewpoint is often enough for bulk chemistry, but it misses the timing noise that matters in gene regulation, intracellular signaling, and rare switching problems. In those settings the basic object is a probability distribution over molecule counts.',
      'The chemical master equation already gives that distributional dynamics, but it becomes unwieldy as the number of species or spatial sites grows. The Doi-Peliti formalism rewrites the same stochastic evolution as an operator equation on occupation-number states. That change in language is what makes tensor-network methods and other algebraic tools practical.',
    ],
    equations: [
      {
        label: 'State vector',
        latex: String.raw`\left|p(t)\right\rangle = \sum_{\mathbf{n}} p(\mathbf{n}, t)\left|\mathbf{n}\right\rangle`,
      },
      {
        label: 'Master equation',
        latex: String.raw`\frac{d}{dt}\left|p(t)\right\rangle = \hat{H}\left|p(t)\right\rangle`,
      },
      {
        label: 'Formal evolution',
        latex: String.raw`\left|p(t)\right\rangle = e^{t\hat{H}}\left|p(0)\right\rangle`,
      },
    ],
  },
  {
    id: 'operators',
    title: 'Creation, Annihilation, And Combinatorics',
    summary: 'Annihilation operators encode how many ways reactants can be chosen, which is why combinatorial factors appear automatically.',
    paragraphs: [
      'For one species, the occupation state |n> means there are n molecules present. The annihilation operator removes one molecule and multiplies by n because there are n indistinguishable choices of reactant. The creation operator adds one molecule without an extra counting factor.',
      'A useful caution is that a dagger here is an algebraic label, not a promise of a quantum-mechanical Hermitian adjoint. Doi-Peliti borrows operator syntax from second quantization, but the state being evolved is a classical probability distribution.',
    ],
    equations: [
      {
        label: 'Operator action',
        latex: String.raw`a\left|n\right\rangle = n\left|n-1\right\rangle,\qquad a^\dagger\left|n\right\rangle = \left|n+1\right\rangle,\qquad \hat{n}=a^\dagger a`,
      },
      {
        label: 'Pair counting',
        latex: String.raw`\frac{1}{2}a^2\left|n\right\rangle = \frac{n(n-1)}{2}\left|n-2\right\rangle`,
      },
    ],
    bullets: [
      'For a reaction such as 2X -> products, the factor n(n-1)/2 is not added by hand later; it is already encoded by a^2.',
      'In practice one often absorbs factorial factors into the stochastic rate constant so the operator form stays compact.',
    ],
  },
  {
    id: 'reaction-operators',
    title: 'From Reactions To Generator Terms',
    summary: 'Each elementary reaction contributes a gain term and a loss term to the generator.',
    paragraphs: [
      'Every stochastic reaction changes probability in two ways: it feeds probability into destination states and removes probability from origin states. In operator form those are the gain and loss pieces inside the square brackets. This is exactly the logic your builder is visualizing.',
      'For pedagogical examples, it is often easiest to remember the pattern first and then specialize. A reaction consumes reactants through annihilation operators, creates products through creation operators, and subtracts the loss term needed for total probability conservation.',
    ],
    equations: [
      {
        label: 'Unimolecular decay',
        latex: String.raw`\hat{H}_{A\to \varnothing}=k\left(a-a^\dagger a\right)`,
      },
      {
        label: 'Bimolecular conversion',
        latex: String.raw`\hat{H}_{2A\to B}=k\left(b^\dagger a^2-a^{\dagger 2}a^2\right)`,
      },
      {
        label: 'Schlogl reaction in the paper',
        latex: String.raw`2X + A \rightleftharpoons 3X,\qquad B \rightleftharpoons X`,
      },
    ],
  },
  {
    id: 'paper-connection',
    title: 'How The 2023 Paper Extends The Idea',
    summary: 'The paper keeps the operator picture but compresses the huge many-body distribution with tensor networks.',
    paragraphs: [
      'Nicholson and Gingrich move from a single well-mixed variable to a one-dimensional chain of diffusing voxels. The state space then grows exponentially, so the central challenge is no longer writing the master equation; it is storing and evolving the full probability distribution.',
      'Their solution is to represent the probability distribution as a matrix product state and the generator as a matrix product operator, then evolve the compressed state with the time-dependent variational principle. That lets them estimate rare switching rates without choosing a reaction coordinate in advance.',
    ],
    equations: [
      {
        label: 'Rare-event rate used in the paper',
        latex: String.raw`k_{BA}=\left.\frac{d}{dt}\frac{\langle 1|\hat{P}_B e^{t\hat{H}}\hat{P}_A|\pi\rangle}{\langle 1|\hat{P}_A|\pi\rangle}\right|_{t>\tau_{\mathrm{mol}}}`,
      },
      {
        label: 'MPS ansatz',
        latex: String.raw`\left|p(t)\right\rangle \approx \sum_{n_1,\ldots,n_L} A^{[1]n_1}A^{[2]n_2}\cdots A^{[L]n_L}\left|n_1,\ldots,n_L\right\rangle`,
      },
    ],
    bullets: [
      'Doi-Peliti gives the local operator structure.',
      'Tensor networks compress the ensemble over an enormous state space.',
      'TDVP evolves that compressed ensemble while preserving the probability-flow picture needed for rare-event fluxes.',
    ],
  },
]

export const FULL_PAPER = {
  title: 'Second Quantization of Stochastic Chemical Reactions Using the Doi-Peliti Method',
  intro:
    'A complete pedagogical companion article for the website, placed alongside the reaction builder so readers can move directly between reaction notation, operator form, and the broader conceptual framework.',
  sections: [
    {
      id: 'full-introduction',
      title: '1. Introduction: Stochastic Chemical Kinetics and Second Quantization',
      paragraphs: [
        'Chemical reactions at small scales, particularly in biological systems, are inherently stochastic. When systems contain tens or hundreds of molecules rather than Avogadro-scale quantities, fluctuations in reaction timing and molecule counts become significant. Such stochastic effects play a central role in cellular biochemistry, gene regulatory networks, and ecological population dynamics.',
        'Traditional chemical kinetics models use deterministic rate equations, typically expressed as systems of ordinary differential equations. These approaches assume molecular populations are large enough to be treated as continuous variables. While effective for macroscopic systems, deterministic models fail when molecule counts are small and random reaction events dominate system behavior.',
        'In these regimes, the dynamics are instead described probabilistically using the Chemical Master Equation, which governs the time evolution of the probability distribution over all possible molecular configurations.',
        'Unfortunately, the Chemical Master Equation rapidly becomes computationally intractable as system size grows, because the number of possible states increases combinatorially.',
        'The Doi-Peliti formalism provides an elegant alternative representation. It maps the Chemical Master Equation onto a framework closely resembling second-quantized quantum mechanics, in which states are represented in a Fock-space-like vector space and reaction dynamics are encoded in linear operators.',
        'Although originally developed for reaction-diffusion systems, the Doi-Peliti approach has become an important analytical tool in statistical physics, theoretical chemistry, and computational biology.',
      ],
    },
    {
      id: 'full-probability-states',
      title: '2. Probability States and the Evolution Equation',
      paragraphs: [
        'Consider a chemical system containing several molecular species. A configuration with $n_A$ molecules of species $A$, $n_B$ molecules of species $B$, and so on is represented by an occupation-number basis vector.',
        'These vectors span a vector space analogous to a Fock space.',
        'The full probabilistic state of the system at time $t$ is written as a superposition over all occupation-number states, with coefficient $p(n,t)$ equal to the probability of configuration $n$ at time $t$.',
        'The probability state evolves according to a linear operator $\\hat{H}$ that encodes all reaction processes.',
        'Formally, this differential equation has a solution given by the exponential of the generator acting on the initial state.',
        'The operator exponential represents the accumulated action of reaction processes over time. Expanding the exponential yields a power series in repeated applications of the reaction generator, with each term corresponding to sequences of reaction events occurring over time.',
        'This compact operator representation allows powerful analytical and numerical techniques to be applied, including perturbative expansions, field-theoretic mappings, and tensor-network simulations.',
      ],
      equations: [
        {
          label: 'Occupation-number basis',
          latex: String.raw`\left|n\right\rangle=\left|n_A,n_B,\ldots\right\rangle`,
        },
        {
          label: 'Probability state',
          latex: String.raw`\left|p(t)\right\rangle=\sum_n p(n,t)\left|n\right\rangle`,
        },
        {
          label: 'Evolution equation',
          latex: String.raw`\frac{d}{dt}\left|p(t)\right\rangle=\hat{H}\left|p(t)\right\rangle`,
        },
        {
          label: 'Formal solution',
          latex: String.raw`\left|p(t)\right\rangle=e^{t\hat{H}}\left|p(0)\right\rangle`,
        },
        {
          label: 'Operator exponential',
          latex: String.raw`e^{t\hat{H}}=\sum_{k=0}^{\infty}\frac{t^k}{k!}\hat{H}^k`,
        },
      ],
    },
    {
      id: 'full-creation-annihilation',
      title: '3. Creation and Annihilation Operators',
      paragraphs: [
        'Each molecular species $A$ is associated with two operators: an annihilation operator $a$ and a creation operator $a^\\dagger$.',
        'Their actions on basis states are defined so that annihilation lowers the occupation by one and multiplies by the current molecule count, while creation raises the occupation by one.',
        'The coefficient $n_A$ appears because there are $n_A$ indistinguishable molecules that could be removed.',
        'Thus annihilation operators naturally encode the combinatorial factors appearing in reaction rates.',
        'Creation operators, by contrast, simply increase the molecule count and therefore do not carry multiplicative coefficients.',
      ],
      equations: [
        {
          latex: String.raw`a\left|n_A\right\rangle=n_A\left|n_A-1\right\rangle`,
        },
        {
          latex: String.raw`a^\dagger\left|n_A\right\rangle=\left|n_A+1\right\rangle`,
        },
      ],
    },
    {
      id: 'full-reaction-operators',
      title: '4. Constructing Reaction Operators',
      paragraphs: [
        'The number operator is defined as $a^\\dagger a$. Its action on a basis state returns the particle number, which makes it useful for computing expectation values of molecule counts.',
        'Consider first unimolecular decay, $A\\to\\varnothing$, with rate constant $k$. The operator representation contains one term that removes a molecule from the state and a second term that ensures conservation of probability by subtracting the probability flux leaving each state.',
        'For the bimolecular reaction $2A\\to B$, the operator form removes two molecules of $A$ and creates one molecule of $B$. The normalization term again ensures that total probability remains conserved.',
      ],
      equations: [
        {
          label: 'Number operator',
          latex: String.raw`\hat{N}=a^\dagger a`,
        },
        {
          label: 'Number operator action',
          latex: String.raw`\hat{N}\left|n\right\rangle=n\left|n\right\rangle`,
        },
        {
          label: 'Unimolecular decay',
          latex: String.raw`\hat{H}_{\mathrm{decay}}=k\left(a-a^\dagger a\right)`,
        },
        {
          label: 'Bimolecular reaction',
          latex: String.raw`\hat{H}_{2A\to B}=k\left(b^\dagger a^2-a^{\dagger 2}a^2\right)`,
        },
      ],
      bullets: [
        'The term a^2 removes two molecules of A.',
        'The term b^\\dagger creates one molecule of B.',
        'The subtraction term keeps the net probability normalized.',
      ],
    },
    {
      id: 'full-matrix-representation',
      title: '5. Matrix Representation of Operators',
      paragraphs: [
        'Creation and annihilation operators can also be represented explicitly as infinite-dimensional matrices acting on the occupation-number basis.',
        'For the annihilation operator, the nonzero entries sit just above the diagonal and increase as 1, 2, 3, and so on. Acting on $|n\\rangle$ therefore reproduces the factor $n|n-1\\rangle$ because there are $n$ ways to choose a molecule to remove.',
        'For the creation operator, the nonzero entries sit just below the diagonal. Acting on $|n\\rangle$ raises the occupation to $|n+1\\rangle$.',
        'Unlike ordinary quantum mechanics, $a^\\dagger$ is not necessarily the Hermitian adjoint of $a$ under the inner product used in the Doi-Peliti formalism. Instead, the operators are defined algebraically to reproduce the combinatorics of stochastic chemical reactions.',
      ],
      equations: [
{
  label: 'Annihilation matrix',
  latex: String.raw`a=\begin{bmatrix}
0 & 1 & 0 & 0 & \cdots \\
0 & 0 & 2 & 0 & \cdots \\
0 & 0 & 0 & 3 & \cdots \\
0 & 0 & 0 & 0 & \cdots \\
\vdots & \vdots & \vdots & \vdots & \ddots
\end{bmatrix}`,
},
{
  label: 'Creation matrix',
  latex: String.raw`a^\dagger=\begin{bmatrix}
0 & 0 & 0 & 0 & \cdots \\
1 & 0 & 0 & 0 & \cdots \\
0 & 1 & 0 & 0 & \cdots \\
0 & 0 & 1 & 0 & \cdots \\
\vdots & \vdots & \vdots & \vdots & \ddots
\end{bmatrix}`,
},,
        {
          latex: String.raw`a\left|n\right\rangle=n\left|n-1\right\rangle,\qquad a^\dagger\left|n\right\rangle=\left|n+1\right\rangle`,
        },
      ],
    },
    {
      id: 'full-combinatorics',
      title: '6. Combinatorial Factors in Reaction Rates',
      paragraphs: [
        'Reactions involving identical reactants require combinatorial factors.',
        'For a reaction $2X\\to\\mathrm{products}$, if $n_X$ molecules are present then the number of unordered reactant pairs is the binomial coefficient $\\binom{n_X}{2}$.',
        'Applying annihilation operators automatically produces these factors, so the combinatorial structure of reaction rates emerges naturally from the operator algebra.',
        'Often these factors are absorbed into the rate constant $k$ for notational simplicity.',
      ],
      equations: [
        {
          label: 'Pair count',
          latex: String.raw`\binom{n_X}{2}=\frac{n_X(n_X-1)}{2}`,
        },
        {
          label: 'Operator action',
          latex: String.raw`a^2\left|n\right\rangle=n(n-1)\left|n-2\right\rangle`,
        },
      ],
    },
    {
      id: 'full-tensor-networks',
      title: '7. Tensor Network Representations',
      paragraphs: [
        'A major advantage of the operator formulation is that it enables tensor-network representations of stochastic systems.',
        'The probability vector $|p(t)\\rangle$ can be decomposed into a Matrix Product State. In that decomposition each site tensor carries a local occupation-number index, and the full probability distribution is reconstructed by contracting the chain of tensors.',
        'Similarly, the generator $\\hat{H}$ can be expressed as a Matrix Product Operator.',
        'This representation enables efficient compression of large state spaces, numerical time evolution using algorithms such as time-evolving block decimation, and variational methods for computing steady states.',
        'The Doi-Peliti formalism is particularly compatible with tensor networks because reaction generators typically decompose into local interaction terms, precisely the structure required for efficient Matrix Product Operator representations.',
        'Recent research has applied tensor-network contraction algorithms to stochastic chemical kinetics, enabling simulations of systems far beyond the reach of traditional Chemical Master Equation solvers.',
      ],
      equations: [
        {
          label: 'Matrix Product State form',
          latex: String.raw`\left|p(t)\right\rangle=\sum_{n_1,\ldots,n_L} A^{[1]n_1}A^{[2]n_2}\cdots A^{[L]n_L}\left|n_1,\ldots,n_L\right\rangle`,
        },
      ],
      bullets: [
        'Efficient compression of large state spaces',
        'Numerical time evolution with tensor-network algorithms',
        'Variational steady-state computation',
      ],
    },
  ] as FullPaperSection[],
  references: [
    'Van Kampen, N. G. Stochastic Processes in Physics and Chemistry. North-Holland (2007).',
    'Gillespie, D. T. "Exact stochastic simulation of coupled chemical reactions." Journal of Physical Chemistry 81 (1977).',
    'Doi, M. "Second Quantization Representation for Classical Many-Particle Systems." Journal of Physics A (1976).',
    'Peliti, L. "Path Integral Approach to Birth-Death Processes on a Lattice." Journal de Physique (1985).',
    'Schollwock, U. "The Density-Matrix Renormalization Group in the Age of Matrix Product States." Annals of Physics (2011).',
    'Verstraete, F., Murg, V., and Cirac, J. I. "Matrix Product States and PEPS." Advances in Physics (2008).',
    'Cui, W. et al. "Tensor-network methods for simulating stochastic chemical kinetics." Journal of Chemical Physics (2022).',
  ],
}
