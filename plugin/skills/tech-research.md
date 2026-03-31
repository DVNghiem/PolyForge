# Tech Research

Systematic technology evaluation framework.

## Discovery Phase

1. **Official docs**: README, getting started guide, API reference
2. **Package registry**: crates.io, PyPI, npm — download stats, version history
3. **GitHub**: stars, contributors, license, last commit date

## Health Signals

| Signal | Green | Yellow | Red |
|---|---|---|---|
| Last commit | < 1 month | 1-6 months | > 6 months |
| Open issues | Triaged, labeled | Growing backlog | Ignored |
| PR velocity | Regular merges | Slow reviews | PRs abandoned |
| Maintainers | Multiple active | Single person | Inactive |

## Adoption Signals

- Star trend: growing > flat > declining
- Downloads: check weekly/monthly trend, not absolute number
- Production users: logos on README, case studies, conference talks
- Ecosystem: related libraries, plugins, integrations

## Fit Criteria

- **Performance**: Find existing benchmarks. Never fabricate numbers.
- **API ergonomics**: Write a small example. Does it feel natural?
- **Ecosystem compatibility**: Does it work with our existing stack?
- **License**: MIT/Apache-2.0 = safe. GPL = check project requirements.
- **Migration cost**: How hard to adopt? How hard to leave?

## Tech Brief Template

```
# Tech Brief: <Technology>
## Summary (2-3 sentences)
## Pros
## Cons
## Performance
## Maturity (stable | growing | experimental)
## Community (active | moderate | sparse)
## Fit Assessment
## Recommendation (adopt | evaluate further | reject)
## Confidence (HIGH | MEDIUM | LOW)
```

## Decision Criteria

- **Adopt**: Strong evidence, good fit, active maintenance, team consensus
- **Evaluate further**: Promising but insufficient data; need prototype or deeper research
- **Reject**: Poor fit, inactive maintenance, better alternatives exist
