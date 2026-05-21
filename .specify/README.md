# Spec Kit Integration

This repository uses a lightweight Spec Kit-compatible structure for durable specification work.

The official GitHub Spec Kit initializer was not run during this setup because the local environment did not have `uvx` or `CODEX_HOME` available. The files here are intentionally plain Markdown so they remain useful before and after official CLI initialization.

## Recommended Workflow

Use Spec Kit for larger product or architecture slices:

1. Specify the user-facing behavior and acceptance criteria.
2. Clarify ambiguities before planning.
3. Plan the technical approach against the constitution.
4. Break the plan into ordered, independently verifiable tasks.
5. Implement one task slice at a time.

Small bug fixes and narrow cleanups can continue directly from `TASKS.md`.

## Official Codex Setup

When the environment has `uvx` and `CODEX_HOME`, run:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --integration codex
```

After initialization, preserve the project-specific content in:

- `AGENTS.md`
- `TASKS.md`
- `.specify/memory/constitution.md`
- `.specify/specs/001-platform-foundation/`

If generated templates conflict with local content, keep the product decisions and merge the newer Spec Kit mechanics around them.

