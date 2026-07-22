# TensorNetwork.org contribution: Doi-Peliti Method

This folder is a ready-to-submit page for [tensornetwork.org](https://tensornetwork.org). It is
authored in the same format the site uses: a page is a folder under `src/` containing an
`index.md`, an optional `index.bib`, and its figures.

## What is here

```
doi_peliti/
  index.md            the page, in TensorNetwork.org markdown
  index.bib           BibTeX entries for the \cite keys used in index.md
  factor_tensor.svg   a single factor tensor (order, dimension)
  contraction.svg     a contraction (internal vs external indices)
  mps.svg             a Matrix Product State for |p(t)>
  mpo.svg             a Matrix Product Operator for H-hat
  operator_term.svg   the Schlogl forward step as an operator diagram
```

## How to add it to the site

1. Clone the site source: `git clone https://github.com/TensorNetwork/tensornetwork.org`.
2. Copy the `doi_peliti/` folder into the site's `src/` directory.
3. Optionally add a link to it from a relevant index page (for example `src/stat_phys/index.md`)
   using a wiki link: `[[Doi-Peliti Method|doi_peliti]]`.
4. Build locally to check it, following the steps in the site's own README
   (`julia generate.jl`, then serve the generated folder).

The generator turns `index.md` into `doi_peliti.html`, resolves the `\cite{...}` keys against
`index.bib`, appends a numbered References section automatically, and builds the floated table of
contents from the `<!--TOC-->` marker.

## Conventions this page follows

- **Terminology.** Uses the site's defined terms: order, dimension, factor tensor, internal and
  external index, rank. See `src/contribute/conventions.md`.
- **Writing style.** A high level synopsis and concrete examples come before formal specifications.
  The language is domain-neutral and avoids quantum-specific jargon, except for the one note that the
  dagger is not a Hermitian adjoint here. See `src/contribute/style.md`.
- **Diagrams.** Tensor diagram notation is used wherever it helps: tensors are shaded shapes, indices
  are lines, and joined lines denote contraction. See `src/diagrams/`.
- **Single topic.** The page is about the Doi-Peliti method itself, not a summary of one paper. The
  2023 reaction-diffusion study is cited as an application, not as the subject.
- **Math.** Inline math uses `$...$`; display math uses `\begin{equation}` and `\begin{align}`, which
  the site renders with KaTeX.
- **Links.** Internal references use wiki links, for example `[[Matrix Product State|mps]]`.

## Figures: SVG vs PNG

The figures are provided as SVG so they are crisp at any size and easy to edit by hand. The site's
existing figures are PNGs exported from a Keynote file. The width-control alt tags
(`small`, `small40`, `medium`, `large`) work the same way for either format, so the SVGs render
correctly as-is. If the maintainers prefer PNG to match the rest of the site, each SVG can be
exported with, for example:

```
rsvg-convert -w 1200 factor_tensor.svg -o factor_tensor.png
```

and the matching `index.md` image lines updated from `.svg` to `.png`.

## The interactive component

The page links to a hosted interactive reaction-network builder. The static site cannot run the
React application itself, so the builder is deployed separately (for example with GitHub Pages from
the `reaction_network_builder` repository) and linked from `index.md`. The static figures in the
page mirror what the builder shows, so the page stands on its own for readers who do not open it.

Update the URL in `index.md` (currently `https://jamie2111.github.io/reaction_network_builder/`)
to wherever the builder is deployed.
