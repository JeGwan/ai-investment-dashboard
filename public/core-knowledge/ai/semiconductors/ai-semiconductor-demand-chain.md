---
sector: AI
subsector: semiconductors
title: AI Semiconductor Demand Chain
status: core
---

# AI Semiconductor Demand Chain

Evergreen reference for how AI usage can translate into semiconductor demand.

Use this note for stable concepts, definitions, and causal links. Time-sensitive claims and source-backed measurements should remain in dated reports and their report-local `data/metrics.json`.

```mermaid
flowchart LR
  Usage[AI usage] --> Tokens[Token demand]
  Tokens --> Inference[Inference capacity]
  Inference --> GPU[GPU]
  Inference --> Memory[Memory]
  GPU --> Packaging[Advanced Packaging]
  Memory --> Packaging
```
