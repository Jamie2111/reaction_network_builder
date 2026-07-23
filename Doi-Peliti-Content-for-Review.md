# Doi-Peliti Method

*Pedagogical content for review. This is the full written text of the page (prose, equations, figure captions, and references). Interactive components are omitted; where they appear on the page, a bracketed note marks the spot. Inline citations are shown as [n] and listed at the end. Equations are in LaTeX and render in any Markdown viewer with math support (GitHub, VS Code, Obsidian, Typora).*

---

The Doi-Peliti method [1,2] recasts the dynamics of a stochastic chemical reaction network as a single linear operator acting on a vector of configuration probabilities. Working in terms of integer molecule counts rather than continuous concentrations expresses each reaction as a product of creation and annihilation operators, and the combinatorial factors associated with indistinguishable reactants arise directly from the action of those operators.

This operator representation is also the natural point of departure for tensor-network methods. The probability vector is represented as a Matrix Product State and the generator as a Matrix Product Operator, so that a state space growing as $d^{L}$ can be stored and propagated within a controllable memory budget [7]. The builder on the page assembles a reaction mechanism and displays the corresponding operator form and tensor diagrams.

## Why count molecules instead of concentrations

Deterministic chemical kinetics tracks concentrations through coupled ordinary differential equations, a description that is accurate when every species is present in large numbers and its concentration is effectively continuous. That description fails when a species is present in only tens or hundreds of copies, as is common for gene products, intracellular signaling molecules, and reactions confined to small volumes. In this regime the copy number of each species is a discrete integer that changes by a whole number of molecules at each reaction event, and the timing of those events is a random process.

The appropriate description is then a probability distribution over integer copy numbers. Writing $\mathbf{n}$ for the vector of copy numbers of each species, $p(\mathbf{n}, t)$ denotes the probability of configuration $\mathbf{n}$ at time $t$, and its evolution obeys the chemical master equation [3], a linear rate equation with one term per reaction. The master equation is readily written but difficult to solve, since the number of accessible configurations grows combinatorially with the number of species [4].

The Doi-Peliti method does not alter the underlying physics. It re-expresses the same master equation in an operator language that exposes its algebraic structure and, in particular, renders it amenable to tensor-network representation.

## Reactions as operators

Consider a single species, and let $|n\rangle$ denote the state containing exactly $n$ molecules. These occupation-number states form a basis, and any probability distribution over copy numbers is a nonnegative linear combination of them. The state of the system is the probability vector expressed in this basis,

$$\left|p(t)\right\rangle = \sum_{\mathbf{n}} p(\mathbf{n}, t)\left|\mathbf{n}\right\rangle .$$

Two operators connect neighboring basis states. The annihilation operator $a$ removes one molecule and multiplies by $n$, reflecting the $n$ indistinguishable molecules that could be removed. The creation operator $a^{\dagger}$ adds one molecule and carries no numerical prefactor,

$$a\left|n\right\rangle = n\left|n-1\right\rangle , \qquad a^\dagger\left|n\right\rangle = \left|n+1\right\rangle , \qquad \hat{n}=a^\dagger a .$$

Combinatorial factors therefore arise automatically. A step that consumes two molecules of the same species acquires the factor $n(n-1)$ directly from the operator algebra, with no binomial coefficient introduced by hand,

$$a^2\left|n\right\rangle = n(n-1)\left|n-2\right\rangle .$$

A caveat on notation is warranted. The dagger is an algebraic label rather than a Hermitian conjugate. The Doi-Peliti construction borrows the symbols of second quantization, but the evolved object is a classical probability distribution rather than a quantum wave function, normalized in the 1-norm (its entries sum to one) rather than the 2-norm.

The builder below assembles elementary steps and displays each reaction as a balanced equation together with its generated operator term; hovering over an operator reveals the truncated matrix it represents. The preset loads the reversible Schlogl model, a standard test case for stochastic bistability and switching.

> *[Interactive reaction-network builder, with a live operator diagram beneath it. Live-diagram caption: "The current step represented as a generator term acting on the occupation line of each species. A shaded box is a creation operator a-dagger, and an open box is an annihilation operator a; the exponent gives the number of molecules created or removed. The two external lines on each row are the incoming and outgoing occupation indices."]*

## How a reaction becomes an operator

The operator terms generated by the builder follow a fixed structure: each elementary reaction contributes a rate constant multiplying a gain term minus a loss term. The origin of this structure is clearest for the simplest reaction. (The builder denotes the annihilation and creation operators of species $X$ by $x_X$ and $x_X^{\dagger}$, the species-labeled counterparts of $a$ and $a^{\dagger}$.) Consider the unimolecular decay $A\to\varnothing$ with rate constant $k$,

$$\hat{H}_{A\to\varnothing} = k\left(a - a^\dagger a\right) .$$

The gain term $a$ removes one molecule, transferring probability from each state to the state with one fewer molecule. The loss term $a^{\dagger}a$ is the number operator, with $a^{\dagger}a\left|n\right\rangle = n\left|n\right\rangle$ counting the molecules available to decay while leaving the configuration unchanged; the minus sign removes the corresponding probability from the originating state. Probability leaves each state at exactly the rate at which it accumulates elsewhere, which is the statement of conservation.

The bimolecular reaction $2A\to B$ has the operator

$$\hat{H}_{2A\to B} = k\left(b^\dagger a^2 - a^{\dagger 2} a^2\right) .$$

Its new element is the pair annihilation $a^2$. Since $a^2\left|n\right\rangle = n(n-1)\left|n-2\right\rangle$, the operator already encodes the number of ordered pairs of reacting molecules. The gain term $b^{\dagger}a^2$ removes two molecules of $A$ and creates one of $B$, while the loss term $a^{\dagger 2}a^2$ counts the same pairs and restores them. The combinatorial factor is supplied by the annihilation operators rather than inserted separately.

The forward Schlogl step, $2X + A \to 3X$, follows the same construction with additional species. Factoring out the annihilation of the reactants exposes the structure,

$$\mathbb{W}_{1,f} = \frac{c_1}{2}\left(x_X^{\dagger 3} - x_X^{\dagger 2}\, x_A^{\dagger}\right) x_X^{2}\, x_A .$$

Reading from right to left, the factor $x_X^{2}\, x_A$ annihilates the reactants and supplies the $\tfrac{1}{2}n_X(n_X-1)\,n_A$ ways of selecting the two identical $X$ and one $A$, with the prefactor $\tfrac{1}{2}$ correcting for the ordering of the two $X$. The bracketed term then either creates the three product molecules of $X$, which is the gain, or restores the two $X$ and one $A$ that were consumed, which is the loss. Their difference is the net change in configuration, and the minus sign enforces probability conservation. For a general reaction with reactant stoichiometry $\eta_i$, product stoichiometry $\mu_i$, and rate constant $k$, the operator is

$$\hat{H} = k\left(\prod_i \left(a_i^\dagger\right)^{\mu_i} - \prod_i \left(a_i^\dagger\right)^{\eta_i}\right)\prod_i a_i^{\eta_i} .$$

The reverse step follows the same construction applied to the reversed reaction $3X \to 2X + A$; its operator $\mathbb{W}_{1,r}$ therefore exchanges the roles of products and reactants and carries a prefactor $c_2/3! = c_2/6$ for the three identical $X$. In the builder, reversing the reaction direction interchanges the two operators, and modifying the stoichiometry updates the operator exponents and combinatorial prefactors accordingly.

## Building the generator

A reaction mechanism comprises several elementary reactions, and its generator $\hat{H}$ is the sum of the operator terms of the individual steps, so the mechanism assembled in the builder corresponds to a single matrix. Because each term is constructed as gain minus loss, the sum conserves total probability.

This generator specifies the full dynamics. The distribution evolves under a single linear equation whose formal solution is a matrix exponential, so that the entire time evolution is determined by $\hat{H}$ and the initial condition,

$$\frac{d}{dt}\left|p(t)\right\rangle = \hat{H}\left|p(t)\right\rangle , \qquad \left|p(t)\right\rangle = e^{t\hat{H}}\left|p(0)\right\rangle .$$

Constructing $\hat{H}$ is straightforward; the difficulty lies in applying $e^{t\hat{H}}$, since $\left|p(t)\right\rangle$ carries one entry for every accessible configuration and the dimension of this space grows exponentially with system size. Tensor networks provide a controlled approximation for this evolution, for which the natural first step is a diagrammatic representation of the operators.

## Reading the operators as tensor diagrams

Operators constructed from $a$ and $a^{\dagger}$ are tensors, and tensor diagram notation provides a compact representation of them. In this notation a tensor is drawn as a shaded shape, and each index is a line emanating from it. The number of lines is the order of the tensor, and the number of values an index can take is its dimension; a matrix, for example, is an order-2 tensor with one incoming and one outgoing line.

> *[Figure: a single tensor. Caption: "A single tensor. Each line is an index, and the number of lines is the order of the tensor (here, order 3). The number of values an index can take is its dimension."]*

Connecting two lines denotes a contraction, that is, a summation over the shared index. For example, contracting $M_{ij}$ with $N_{jkl}$ over the shared index $j$ produces a tensor with external indices $i$, $k$, and $l$,

$$T_{ikl} = \sum_{j} M_{ij}\, N_{jkl} .$$

> *[Figure: a contraction of two tensors, representing the equation above. Caption: "A contraction of two tensors: the connected line denotes summation over the shared index. That line is an internal index, and the uncontracted lines are external indices."]*

A line joining two shapes is an internal index of the resulting network, and each line left uncontracted is an external index. The order of the tensor computed by a diagram equals the number of external lines, so a diagram with no uncontracted indices evaluates to a scalar.

These two rules, shapes with indices and contractions as summations, suffice to represent the operators introduced above and, in the following section, the full state and generator.

## From operators to tensor networks

A single well-mixed species can be treated directly. The tensor-network representation becomes valuable when the distribution is high-dimensional, whether because the network contains many chemical species whose copy numbers are correlated or because a spatially extended system is resolved into a chain of small volumes, or voxels. In either case the degrees of freedom form a chain of sites, one per species or per voxel, each carrying its own occupation number, and a chain of $L$ sites supports a distribution over $d^{L}$ configurations once each occupation is truncated to $d$ states. Storing this distribution explicitly is intractable for all but the smallest systems.

A Matrix Product State circumvents explicit storage. The distribution is expressed as a chain of factor tensors, one per site, each carrying a vertical external index for its local occupation and horizontal internal indices connecting it to its neighbors,

$$\left|p(t)\right\rangle \approx \sum_{n_1,\ldots,n_L} A^{[1]n_1}A^{[2]n_2}\cdots A^{[L]n_L}\left|n_1,\ldots,n_L\right\rangle .$$

> *[Figure: a Matrix Product State chain. Caption: "A Matrix Product State for the probability vector |p(t)>. Each factor tensor carries a vertical external index (a local occupation number) and is connected to its neighbors by horizontal internal (bond) indices."]*

The dimension of these internal bonds, denoted $\chi$, controls the amount of correlation between sites that the representation can capture. It is the rank of the factorization across each bipartition of the chain, and increasing it improves accuracy at the cost of memory.

The generator admits the same structure. Because each Doi-Peliti operator couples only a few sites, $\hat{H}$ can be written as a Matrix Product Operator, a chain of factor tensors each carrying an upper and a lower external index.

> *[Figure: a Matrix Product Operator chain, with upper indices n_i and lower indices n'_i. Caption: "A Matrix Product Operator for the generator H-hat. Each factor tensor carries an upper external index n_i and a lower external index n'_i, mapping occupation states to occupation states, and is connected to its neighbors by internal bond indices."]*

Time evolution then proceeds by contracting the operator network with the state network and compressing the result to a prescribed bond dimension [7]. The controls below compare the number of parameters in the tensor-network representation with the size of the full distribution as the chain length increases.

> *[Interactive chain diagram with sliders for the number of sites, the bond dimension, and the occupation cut-off. The local dimension is d+1 for a cut-off of d (occupations 0..d), so the full distribution has $(d+1)^{L}$ entries and the open-boundary MPS has $(L-2)\chi^{2}(d+1) + 2\chi(d+1)$ parameters. Note beneath it: "Increasing the bond dimension chi raises the rank the representation can capture, improving accuracy at the cost of memory. The full distribution grows as $(d+1)^{L}$, so a compressed tensor-network representation becomes necessary as the chain length increases."]*

## Application: rare events on a reaction-diffusion chain

A representative application is the estimation of rare transition rates, such as the switching of a spatially extended bistable system between its two stable states. Direct simulation is inefficient in this setting, because the transition occurs infrequently and the configuration space is too large to enumerate. In the operator formulation the rate is expressed as a ratio of contractions: the distribution is projected onto the initial basin, evolved under the generator, and projected onto the target basin, and the rate is read off from the growth of the projected probability once short-time transients have decayed.

This procedure has been implemented for a reaction-diffusion chain by representing the distribution as a Matrix Product State and the generator as a Matrix Product Operator, and propagating the compressed state with the time-dependent variational principle [6]. The compression renders the extended chain tractable, while the operator representation preserves the exact accounting of probability flow, yielding the switching rate without a prescribed reaction coordinate.

A closely related approach applies the density-matrix renormalization group to survey the rate constants of a well-mixed network, constructing the joint distribution over correlated copy numbers as a tensor network and tracking its variation across parameter space [5]. The operator construction described here provides precisely the input required by such methods.

The overall framework is modular: the Doi-Peliti construction supplies the local operator structure, tensor diagram notation makes that structure explicit, and the Matrix Product State and Operator provide the compression that extends the same formulation to systems well beyond the reach of direct enumeration.

## References

1. M. Doi, "Second Quantization Representation for Classical Many-Particle Systems," Journal of Physics A: Mathematical and General 9, 1465 (1976). [doi:10.1088/0305-4470/9/9/008](https://doi.org/10.1088/0305-4470/9/9/008)
2. L. Peliti, "Path Integral Approach to Birth-Death Processes on a Lattice," Journal de Physique 46, 1469 (1985). [doi:10.1051/jphys:019850046090146900](https://doi.org/10.1051/jphys:019850046090146900)
3. N. G. van Kampen, Stochastic Processes in Physics and Chemistry, 3rd ed. (North-Holland, 2007).
4. D. T. Gillespie, "Exact Stochastic Simulation of Coupled Chemical Reactions," Journal of Physical Chemistry 81, 2340 (1977). [doi:10.1021/j100540a008](https://doi.org/10.1021/j100540a008)
5. J. P. Zima, S. B. Nicholson, and T. R. Gingrich, "Chemical master equation parameter exploration using DMRG," Journal of Chemical Physics 163, 054118 (2025). [doi:10.1063/5.0276591](https://doi.org/10.1063/5.0276591)
6. S. B. Nicholson and T. R. Gingrich, "Quantifying Rare Events in Stochastic Reaction-Diffusion Dynamics Using Tensor Networks," Physical Review X 13, 041006 (2023). [doi:10.1103/PhysRevX.13.041006](https://doi.org/10.1103/PhysRevX.13.041006)
7. U. Schollwock, "The Density-Matrix Renormalization Group in the Age of Matrix Product States," Annals of Physics 326, 96 (2011). [doi:10.1016/j.aop.2010.09.012](https://doi.org/10.1016/j.aop.2010.09.012)
