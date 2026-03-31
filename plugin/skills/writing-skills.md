# Writing Skills

How to author a PolyForge skill document.

## Purpose

A skill file is a compact, reusable reference injected into an agent's context to constrain or guide behavior in a specific domain.

## File Location

`plugin/skills/<kebab-name>.md`

## Content Structure

1. **Title**: `# <Skill Name>` — one line
2. **Description**: 1-sentence summary of what this skill covers
3. **Key Patterns**: Bullet list of actionable patterns to follow
4. **Anti-Patterns**: What to avoid (common mistakes)
5. **Trigger Phrases**: Keywords or contexts that activate this skill

## Length Discipline

- **Target**: 200-400 words
- **Maximum**: 600 words
- **If exceeding 600 words**: Split into two skills

## Actionability Test

Every point in the skill should change agent behavior in a specific, observable way. Remove points that are:
- Background information only
- Obvious or common knowledge
- Not actionable (e.g., "understand the problem first")

## Example Structure

```markdown
# <Skill Name>

<One-sentence description>

## Key Patterns

- <Specific, actionable pattern>
- <Another pattern with concrete example>

## Anti-Patterns

- <Common mistake to avoid>
- <Why it's wrong and what to do instead>
```

## Companion Workflow

If a skill supports a workflow, reference the workflow in the skill and vice versa. Use `writing-skills.md` + `workflows-for-skill.md` together when generating new skill + workflow pairs.
