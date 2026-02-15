# Robot Project Workflow

## When to Use

Use this skill whenever working on tasks in this VLA robotic learning project. It defines how we manage tickets, commit work, and track progress.

## Ticket Workflow

### Picking Up Work

1. Look in the `TODO/` folder for available tasks
2. Tasks are numbered sequentially: `task<N>-<summary>.md`
3. Work tasks roughly in order (lower numbers first), unless dependencies allow parallel work
4. Read the task file thoroughly before starting -- it contains acceptance criteria, technical details, and references

### Working on a Task

1. Implement the acceptance criteria listed in the task file
2. Code is TypeScript, built with Vite, linted with Biome
3. Write clean, well-typed code -- prefer explicit types over `any`
4. Test the work (run it, verify it works in browser / WebXR)

### Completing a Task

When all acceptance criteria are met:

1. Move the task file from `TODO/` to `TODO/DONE/`:
   ```bash
   git mv TODO/task<N>-<summary>.md TODO/DONE/task<N>-<summary>.md
   ```

2. Stage all relevant files (source code + moved task file). **Never use `git add .` or `git add -A`** -- always add individual files:
   ```bash
   git add src/relevant-file.ts
   git add TODO/DONE/task<N>-<summary>.md
   ```

3. Commit with a message referencing the task:
   ```bash
   git commit -m "feat: task<N> - <brief description of what was done>"
   ```

4. Verify with `git status` that the commit succeeded and working tree is clean for that task's changes

## Commit Conventions

- **Prefix**: Use `feat:` for new features, `fix:` for bug fixes, `refactor:` for restructuring, `chore:` for tooling/config
- **Reference task number**: Always include `task<N>` in the commit message
- **Be specific**: Describe what was done, not just the task name
- **Examples**:
  - `feat: task1 - initialize Three.js + WebXR project with Vite and Biome`
  - `feat: task2 - implement WebXR hand tracking for both hands with pinch detection`
  - `fix: task4 - fix Rapier.js grasp constraint not releasing on pinch end`

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Bundler**: Vite
- **Linter/Formatter**: Biome
- **3D Engine**: Three.js
- **XR**: WebXR API (immersive-ar, hand-tracking)
- **Physics**: Rapier.js (WASM)
- **Target Device**: Apple Vision Pro (Safari WebXR)
- **ML (later)**: Python, PyTorch, OpenVLA / SmolVLA

## Project Structure

```
robot/
  TODO/              # Pending task tickets
    task<N>-<name>.md
    DONE/            # Completed task tickets
  src/               # TypeScript source code
  public/            # Static assets
  biome.json         # Biome config
  tsconfig.json      # TypeScript config
  vite.config.ts     # Vite config
  package.json
```

## Important Rules

- **Never `git add .`** -- always add individual files
- **Never `git reset --hard`** without explicit user confirmation
- **Never touch `.cursorignore`** -- leave it untouched always
- **Never commit unless the user explicitly asks** -- present changes first
- Prefer `test.each` for parameterized tests over many individual test cases
- Use conda for Python work (`load_conda` first)
