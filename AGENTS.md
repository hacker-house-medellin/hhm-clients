# AGENTS.md

Owner: `hacker-house-medellin`  
Tracking: `DEN-1950`

Use focused pull requests, preserve interface compatibility, add tests with behavior changes, never commit credentials or customer data, and resolve conflicts semantically using both sides and relevant history.

The canonical repository and Zed package are `hacker-house-medellin/hhm-clients`. Do not revive the superseded `hacker-house-medellin-clients` package identity.

## Functional programming conformance

This repository carries an FP conformance ratchet. Before you land a change:

```sh
python3 tools/fp-conformance/fp_conformance.py .
```

CI compares your findings against `tools/fp-conformance/budget.json` and fails
only when a rule's count *increases*. Do not raise the budget to get green — fix
the new violations. When you clear a class of violation, lower the budget in the
same commit with `--write-budget`.

The principles, the rule codes and the remedy for each are in `FP-GUIDELINES.md`.
