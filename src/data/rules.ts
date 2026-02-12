import type { RuleSection } from '@/models/rules';

/** SWADE rules reference data */
export const RULES_DATA: RuleSection[] = [
  // Character Creation
  {
    id: 'char-creation-overview',
    title: 'Character Creation Overview',
    category: 'Character Creation',
    content: `Creating a hero in Savage Worlds is a straightforward process.

**Steps:**
1. **Concept** — Come up with a general idea of what you want to play.
2. **Race** — Choose your hero's race (Human is the default).
3. **Hindrances** — Select up to one Major and two Minor Hindrances for bonus points.
4. **Traits** — Buy your Attributes (5 points) and Skills (12 points).
5. **Edges** — Purchase Edges using points and/or Hindrance bonus points.
6. **Gear** — Buy your starting equipment.
7. **Derived Statistics** — Calculate Pace, Parry, and Toughness.
8. **Background** — Fill in the details about your character's history.`,
    relatedRules: ['attributes', 'skills', 'edges-overview', 'hindrances-overview', 'derived-stats'],
    examples: [
      {
        title: 'Creating a Fantasy Warrior',
        description: 'A step-by-step example of building a basic fighting character.',
        steps: [
          'Set concept: "Battle-hardened knight"',
          'Pick Human race (free Edge)',
          'Take Heroic (Major) and Loyal (Minor) Hindrances -> 3 points',
          'Assign attributes: Agility d8, Smarts d4, Spirit d6, Strength d8, Vigor d6',
          'Buy core skills + Fighting d8, Shooting d6, Intimidation d6',
          'Take Brawny and Combat Reflexes Edges',
          'Buy sword, medium shield, and chain armor',
          'Calculate Parry (6), Toughness (7+2 armor), Pace (6)',
        ],
      },
    ],
    tags: ['creation', 'overview', 'steps', 'new character', 'getting started'],
  },
  {
    id: 'attributes',
    title: 'Attributes',
    category: 'Traits',
    content: `Every character has five basic Attributes: **Agility**, **Smarts**, **Spirit**, **Strength**, and **Vigor**.

They start at **d4** and can be raised by spending attribute points. Each step costs **1 point** (d4→d6 = 1 point, d6→d8 = 1 point, etc.).

Characters receive **5 attribute points** to distribute during creation. The maximum die type during creation is **d12**.

- **Agility** — Nimbleness, quickness, and dexterity.
- **Smarts** — Raw intellect, mental acuity, and education.
- **Spirit** — Inner strength, willpower, and guts.
- **Strength** — Raw physical power and muscle.
- **Vigor** — Endurance, health, and resistance to harm.`,
    relatedRules: ['char-creation-overview', 'skills', 'derived-stats'],
    examples: [
      {
        title: 'Attribute Distribution',
        description: 'A typical balanced warrior: Agility d8 (2 pts), Smarts d4 (0), Spirit d6 (1), Strength d6 (1), Vigor d6 (1) = 5 points total.',
      },
    ],
    tags: ['attributes', 'traits', 'agility', 'smarts', 'spirit', 'strength', 'vigor', 'dice'],
  },
  {
    id: 'skills',
    title: 'Skills',
    category: 'Traits',
    content: `Skills are learned abilities like Fighting, Shooting, Notice, etc. Each is linked to an Attribute.

**Buying Skills:**
- Start at d4. Raising a skill costs **1 point per step** up to the linked Attribute's die.
- Raising a skill **above** the linked Attribute costs **2 points per step**.

**Core Skills:** Every character gets 5 core skills at d4 for free:
- Athletics (Agility)
- Common Knowledge (Smarts)
- Notice (Smarts)
- Persuasion (Spirit)
- Stealth (Agility)

Characters receive **12 skill points** during creation.`,
    relatedRules: ['attributes', 'char-creation-overview'],
    examples: [
      {
        title: 'Skill Cost Example',
        description: 'If your Agility is d8, buying Fighting (linked to Agility):',
        steps: [
          'Fighting d4 → d6 = 1 point (at or below Agility)',
          'Fighting d6 → d8 = 1 point (at or below Agility)',
          'Fighting d8 → d10 = 2 points (above Agility)',
          'Fighting d10 → d12 = 2 points (above Agility)',
          'Total for Fighting d12 = 6 points',
        ],
      },
    ],
    tags: ['skills', 'traits', 'core skills', 'fighting', 'shooting', 'linked attribute'],
  },
  {
    id: 'edges-overview',
    title: 'Edges',
    category: 'Traits',
    content: `Edges are special abilities that give characters advantages. They are organized into categories:

- **Background** — Edges representing innate traits or upbringing.
- **Combat** — Tactical advantages in battle.
- **Leadership** — Benefits for commanding allies.
- **Power** — Enhancements for arcane abilities.
- **Professional** — Expertise in a field.
- **Social** — Influence and connections.
- **Weird** — Supernatural or unusual abilities.
- **Legendary** — Pinnacle-rank only abilities.

**Getting Edges:**
- Humans start with one free Edge.
- Hindrance points can buy Edges (2 points = 1 Edge).
- Each Rank advance can grant additional Edges.

**Requirements:** Most Edges have prerequisites — minimum Rank, Attribute die, Skill die, or other Edges.`,
    relatedRules: ['hindrances-overview', 'char-creation-overview', 'advancement'],
    tags: ['edges', 'abilities', 'requirements', 'background', 'combat', 'leadership'],
  },
  {
    id: 'hindrances-overview',
    title: 'Hindrances',
    category: 'Traits',
    content: `Hindrances are character flaws that add depth and earn bonus points during creation.

**Types:**
- **Minor** — Worth 1 point.
- **Major** — Worth 2 points.

**Limits:** A character may take up to **one Major Hindrance** and **two Minor Hindrances** (max 4 points).

**Spending Hindrance Points:**
- **2 points** = Raise an Attribute one die type, OR gain one Edge.
- **1 point** = Gain one additional Skill point, OR gain $1000 in starting funds.`,
    relatedRules: ['edges-overview', 'char-creation-overview'],
    examples: [
      {
        title: 'Hindrance Point Spending',
        description: 'Take Heroic (Major, 2 pts) + Loyal (Minor, 1 pt) = 3 points.',
        steps: [
          '2 points → gain Brawny Edge',
          '1 point → gain 1 extra Skill point',
        ],
      },
    ],
    tags: ['hindrances', 'flaws', 'bonus points', 'minor', 'major'],
  },
  {
    id: 'derived-stats',
    title: 'Derived Statistics',
    category: 'Traits',
    content: `Several important statistics are calculated from other values:

- **Pace** — How fast the character moves per round. Default is **6** (inches/squares).
- **Parry** — 2 + half of Fighting die. Without Fighting it's just **2**.
- **Toughness** — 2 + half of Vigor die. Armor is added on top.
- **Size** — Default 0. Modified by certain Edges/Hindrances/races.`,
    relatedRules: ['attributes', 'skills', 'combat-basics'],
    examples: [
      {
        title: 'Derived Stats Calculation',
        description: 'A character with Fighting d8 and Vigor d6:',
        steps: [
          'Pace: 6 (default)',
          'Parry: 2 + (8÷2) = 6',
          'Toughness: 2 + (6÷2) = 5',
        ],
      },
    ],
    tags: ['pace', 'parry', 'toughness', 'derived', 'calculated', 'defense'],
  },
  // Combat
  {
    id: 'combat-basics',
    title: 'Combat Basics',
    category: 'Combat',
    content: `**Initiative:** Each round, deal Action Cards from a standard poker deck. Characters act in card order (Aces high, ties broken by suit: Spades > Hearts > Diamonds > Clubs). A **Joker** lets the character act whenever they want and adds +2 to all Trait rolls and damage.

**Actions:** Each round a character can:
- Move up to their Pace and take one action without penalty.
- Take **Multi-Actions** at −2 per additional action.

**Attack Rolls:**
- Melee: Roll Fighting vs. target's **Parry**.
- Ranged: Roll Shooting/Athletics vs. base **TN 4**, modified by range, cover, etc.
- A **raise** (4+ over TN) on the attack roll grants +1d6 bonus damage.

**Wild Cards** (player characters and major NPCs) roll an extra **Wild Die** (d6) on all Trait rolls and pick the best result.`,
    relatedRules: ['damage-basics', 'derived-stats', 'shaken-wounds'],
    examples: [
      {
        title: 'Basic Melee Attack',
        description: 'Red the warrior attacks an orc (Parry 5).',
        steps: [
          'Roll Fighting d8 + Wild Die d6',
          'Fighting: 6, Wild Die: 4 → use 6',
          '6 vs Parry 5 → Hit!',
          '6 is 1 over Parry (no raise)',
          'Roll damage: Str d8 + Weapon d8 = 3 + 5 = 8',
        ],
      },
    ],
    tags: ['combat', 'initiative', 'actions', 'attack', 'wild die', 'cards', 'fighting', 'shooting'],
  },
  {
    id: 'damage-basics',
    title: 'Damage & Wounds',
    category: 'Damage',
    content: `**Dealing Damage:**
- Roll the weapon's damage dice + Strength die (for melee).
- If the total meets or exceeds the target's **Toughness**, they are **Shaken**.
- Each **Raise** (4+ over Toughness) causes a **Wound**.

**Wounds:**
- Extras (minor NPCs) are **Incapacitated** with one Wound.
- Wild Cards can take **3 Wounds** before being Incapacitated.
- Each Wound inflicts **−1** to all Trait rolls (stacking).

**Soaking:**
- Immediately after being hit, spend a **Benny** to make a **Vigor** roll.
- Each Success and Raise reduces one Wound.`,
    relatedRules: ['combat-basics', 'shaken-wounds'],
    tags: ['damage', 'wounds', 'toughness', 'soak', 'benny', 'incapacitated'],
  },
  {
    id: 'shaken-wounds',
    title: 'Shaken & Stunned',
    category: 'Damage',
    content: `**Shaken:**
- A Shaken character can only take free actions (no movement or normal actions).
- At the start of their turn, make a **Spirit** roll to recover.
- Success: No longer Shaken, can act normally.
- Failure: Still Shaken, can only take free actions.
- A character can spend a **Benny** to instantly recover from Shaken.

**Stunned:**
- Some effects cause Stun (e.g., being hit in the head).
- Stunned characters are **Distracted** and **Vulnerable** until they recover.
- Make a Vigor roll at −2 at the start of each turn to recover.`,
    relatedRules: ['combat-basics', 'damage-basics'],
    tags: ['shaken', 'stunned', 'recovery', 'spirit', 'benny', 'status'],
  },
  {
    id: 'advancement',
    title: 'Advancement',
    category: 'Character Creation',
    content: `Characters advance by earning **Advances**. Each Advance, a character may choose one of:

1. **Gain a new Edge** (must meet requirements).
2. **Increase a Skill** that is equal to or greater than its linked Attribute by one die type.
3. **Increase two Skills** that are lower than their linked Attributes by one die type each.
4. **Increase an Attribute** by one die type (once per Rank).
5. **Remove a Minor Hindrance**, or reduce a Major to Minor.

**Rank Progression:**
| Advances | Rank |
|---|---|
| 0–3 | Novice |
| 4–7 | Seasoned |
| 8–11 | Veteran |
| 12–15 | Heroic |
| 16+ | Legendary |`,
    relatedRules: ['char-creation-overview', 'edges-overview'],
    tags: ['advancement', 'experience', 'rank', 'level up', 'progression', 'advances'],
  },
  {
    id: 'wild-cards-extras',
    title: 'Wild Cards & Extras',
    category: 'Traits',
    content: `Savage Worlds distinguishes between two types of characters:

**Wild Cards** (represented by the ♠ symbol):
- Player characters and important NPCs.
- Roll an extra **Wild Die** (d6) with all Trait rolls and use the better result.
- Can take **3 Wounds** before Incapacitation.
- Receive **Bennies** for rerolls and Soak rolls.

**Extras:**
- Minor NPCs, henchmen, and mooks.
- Do NOT roll a Wild Die.
- **Incapacitated** by a single Wound.
- Typically simpler stat blocks.`,
    relatedRules: ['combat-basics', 'damage-basics'],
    tags: ['wild card', 'extras', 'wild die', 'npc', 'bennies', 'wounds'],
  },
  {
    id: 'bennies',
    title: 'Bennies',
    category: 'Situational Rules',
    content: `Bennies (from "benefits") are metagame tokens that let players influence the story.

**Starting Bennies:** Each player gets **3 Bennies** per session. The GM gets 1 per player.

**Spending Bennies:**
- **Reroll** any Trait roll (keep the better result).
- **Soak** damage (make a Vigor roll to reduce Wounds).
- **Recover** from Shaken instantly.
- **Draw a new Action Card** for initiative (discard the current one).

**Earning Bennies:**
- Great roleplaying or humor.
- Playing up Hindrances in dramatic situations.
- Drawing a Joker during initiative.
- GM's discretion.`,
    relatedRules: ['shaken-wounds', 'damage-basics', 'combat-basics'],
    tags: ['bennies', 'benefits', 'reroll', 'soak', 'metagame', 'tokens'],
  },
  {
    id: 'tests-support',
    title: 'Tests & Support',
    category: 'Situational Rules',
    content: `**Tests (Trick/Taunt/Intimidation):**
- Oppose a foe with an appropriate skill vs. their linked Attribute.
- Success: Target is **Distracted** or **Vulnerable** (attacker's choice).
- Raise: Target is Distracted or Vulnerable AND **Shaken**.
- Distracted: −2 to all Trait rolls until end of next turn.
- Vulnerable: +2 to all actions taken against the target until end of next turn.

**Support:**
- Aid an ally by rolling an appropriate skill (TN 4).
- Success: +1 to the ally's next Trait roll.
- Raise: +2 to the ally's next Trait roll.
- Direct vs. Indirect support. Direct requires same type of action.`,
    relatedRules: ['combat-basics'],
    tags: ['test', 'support', 'trick', 'taunt', 'intimidation', 'distracted', 'vulnerable'],
  },
];
