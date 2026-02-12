# Critical Game Rules in Code

### Skill Point Costs (`computeSkillPointsSpent`)
- Core skills (5 total: Athletics, Common Knowledge, Notice, Persuasion, Stealth) start at d4 free
- Non-core skills must pay for d4 (start from index -1)
- Each die step at/below linked attribute: **1 point**
- Each die step **above** linked attribute: **2 points**

### Validation (`validateCharacter()`)
- 5 attribute points max (each die step above d4 costs 1)
- 12 skill points max (variable cost)
- Max 1 Major Hindrance, max 2 Minor Hindrances, max 4 hindrance points total

### Derived Stats (`computeDerived()`)
```
Parry = 2 + floor(Fighting die / 2)  // 2 if no Fighting skill
Toughness = 2 + floor(Vigor die / 2)
Pace = 6 (fixed)
```

### Edge Requirements (`services/characterValidator.ts`)
`canTakeEdge()` checks requirements array: rank, attribute minimums, skill minimums, prerequisite edges. `getUnmetRequirements()` returns human-readable strings for UI.
