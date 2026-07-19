# other/ — separate projects moved out of Nexus AI

These are **not** part of the Nexus AI application. They were separate
experiments/projects living in the same folder, moved here on 2026-07-18 to
declutter the Nexus root. Nexus imports none of them — moving them did not
affect the Nexus build.

| Folder | What it is |
|--------|------------|
| `founderos/` | FounderOS — separate self-contained app (own package.json) |
| `hero-app/` | Separate hero/experiment app (own package.json) |
| `startup-team-os/` | Separate app (own package.json) |
| `startup-oracle/` | Separate app (own package.json) |
| `founderos-src/` | FounderOS/Story3D files that had been mixed into Nexus `src/` — the scrollytelling landing (`FounderOSLanding.jsx`, `Story3D.jsx`) and their components. Nothing in Nexus routed them. |
| `FOUNDEROS_SCROLLYTELLING_PROMPT.md` | The FounderOS design brief. |

**Still in the Nexus root (couldn't move):** `3d-office/` — a running server was
holding it ("Device or resource busy"). Stop that server, then:
`mv 3d-office other/`

To run any of these apps, `cd` into its folder and use its own package.json
(e.g. `cd other/founderos && npm install && npm run dev`).
