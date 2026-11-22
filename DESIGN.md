# Flagmint: design direction

## Product

Flagmint is a small collection of geography minigames in Indonesian and English:
guess the flag, guess the capital, guess a country's subdivision flags, and
practise with a browsable atlas. It is played in short sessions, mostly on a
phone, often between other things.

## Direction

Reading this as: a casual-learning game site for Indonesian players aged 15 and
up, with a modern editorial-minimal language, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

The interface behaves like a well-printed quiz sheet: warm paper, dark ink,
hairline rules, one hot accent, and flags presented like specimens on white
plates. Colour comes from the flags, not from the chrome.

## System

- Canvas: warm paper `#F4F1E9`, surface white, ink `#14160F`.
- Accent: paprika `#C63D13` (light) / `#FF6A3D` (dark). Used for the primary
  action, the answer streak, and the difficulty marker only.
- Type: Bricolage Grotesque for display (slightly odd, friendly, not a SaaS
  default), Instrument Sans for UI. Tabular numerals for scores and timers.
- Radius: 4px for controls, 10px for panels, 18px for large surfaces. No pills
  except status labels that genuinely need to be compact.
- Shadow: almost none. Elevation is carried by 1px lines and a 2px offset solid
  edge on the flag plate, because printed cards do not float.
- Motion: 120 to 240ms, purposeful only. Question card enters, answer states
  resolve, score ticks. All of it stops under `prefers-reduced-motion`.
- Theme: light default, full dark mode via `data-theme`, because a game people
  play at night should not blind them. Flags always sit on a near-white plate in
  both themes, like objects in a display case.

## Reasons

- Warm paper, not pure white: keeps long sessions comfortable and gives the
  site a printed-atlas character that survives swapping the wordmark.
- Paprika accent: flags already use blue, red, green and yellow. A single warm
  accent stays out of their way while still giving the primary action a voice.
- Flags on white plates: many flags have white fields (Japan, Finland, Cyprus).
  A fixed light plate keeps every flag legible in both themes.
- Hairline rules and offset edges instead of shadows: the layout should read as
  a sheet of stamps and labels, not as a stack of floating app cards.
- Four difficulty tiers are editorial, not algorithmic: recognisability and how
  easily a flag is confused with a neighbour's. The About page says so.
- No stock illustrations, no fake social proof, no invented statistics. The
  numbers on the site are counted from the shipped dataset at build time.
