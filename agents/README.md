# Agent System Prompts

This directory contains system prompts for the agentic architecture that powers the v0-clone development workflow.

## Agents

### 1. Planner (`planner.md`)
Breaks down user specifications into actionable tasks with priorities and dependencies.

**Use when**: Starting a new feature, planning a major change, or decomposing complex requirements.

### 2. Coder (`coder.md`)
Implements features by writing and editing code files (UI, backend, infrastructure).

**Use when**: Implementing features, fixing bugs, or making code changes.

### 3. Runner (`runner.md`)
Executes development servers, tests, linting, and builds.

**Use when**: Testing changes, building for production, or running quality checks.

### 4. Critic (`critic.md`)
Reviews code changes and suggests improvements based on quality, security, and best practices.

**Use when**: Code review is needed before merging or to identify potential issues.

### 5. Fixer (`fixer.md`)
Applies patches and fixes issues until all checks pass.

**Use when**: Addressing feedback from Critic or Runner, fixing failing tests or builds.

### 6. Publisher (`publisher.md`)
Builds artifacts, deploys to environments, and generates changelogs.

**Use when**: Ready to deploy, creating a release, or publishing artifacts.

### 7. DB Steward (`db-steward.md`)
Manages database migrations, seeding, drift detection, and ER diagrams.

**Use when**: Making schema changes, seeding data, or checking database health.

### 8. Archivist (`archivist.md`)
Tags releases, snapshots logs and artifacts, maintains historical records.

**Use when**: Creating releases, archiving builds, or preserving run artifacts.

## Workflow

```
User Request
    ↓
Planner → Creates tasks in task.md
    ↓
Coder → Implements features
    ↓
Runner → Tests and validates
    ↓
Critic → Reviews changes
    ↓
Fixer → Applies fixes (loops until green)
    ↓
Publisher → Deploys
    ↓
Archivist → Archives and tags
```

## Usage

Each agent prompt can be:
1. Used directly by AI models as system context
2. Referenced for guidelines when performing manual tasks
3. Extended or customized for specific project needs

## Customization

To customize an agent:
1. Copy the relevant `.md` file
2. Modify the responsibilities, standards, or output formats
3. Use the modified prompt in your workflow
