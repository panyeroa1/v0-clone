# Documentation

This directory contains generated documentation and diagrams.

## Contents

### Generated Files

- **`er-diagram.md`** - Database entity-relationship diagram (auto-generated)
  - Generated with: `pnpm db:er-diagram`
  - Shows all tables, columns, and relationships
  - Includes Mermaid diagram for visualization

### Usage

#### Generate ER Diagram

```bash
pnpm db:er-diagram
```

This will create or update `er-diagram.md` with the current database schema.

#### View Diagrams

The ER diagram uses Mermaid syntax, which renders in:
- GitHub (native support)
- VS Code (with Mermaid extension)
- Online Mermaid editors

### Documentation Structure

```
docs/
├── README.md          # This file
├── er-diagram.md      # Generated ER diagram
└── .gitkeep           # Ensures directory exists
```

### Regeneration

Regenerate documentation when:
- Database schema changes
- After running migrations
- Before major releases
- When updating architecture docs

### Integration

The ER diagram is referenced in:
- `/lib/db/README.md` - Database documentation
- `/ARCHITECTURE.md` - Architecture documentation
- Pull request templates (for schema changes)

## Best Practices

- ✅ Regenerate after schema changes
- ✅ Commit generated docs with schema PRs
- ✅ Review generated docs for accuracy
- ✅ Keep documentation up to date
- ❌ Don't manually edit generated files
- ❌ Don't commit draft/work-in-progress docs here

## Additional Documentation

For other documentation, see:
- `/README.md` - Project overview
- `/ARCHITECTURE.md` - Technical architecture
- `/CONTRIBUTING.md` - Contribution guidelines
- `/agents/README.md` - Agent system
- `/lib/db/README.md` - Database details
- `/deploy/README.md` - Deployment guides
- `/playwright/README.md` - Testing documentation
