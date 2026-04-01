# Doi-Peliti Playground

A small pedagogical React/Vite site for building stochastic reaction steps, viewing their Doi-Peliti operator form, and reading a paper-oriented companion for the Nicholson-Gingrich rare-event tensor-network paper.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## What is included

- An elementary-reaction builder with reversible and one-way steps
- Live KaTeX rendering for reaction equations and second-quantized forms
- Hoverable operator matrices for the truncated creation and annihilation operators
- A Schlogl preset matching the paper's core reaction scheme
- A collapsible pedagogical companion that connects the interface to the 2023 Physical Review X paper
