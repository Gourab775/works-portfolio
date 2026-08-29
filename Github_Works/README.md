# Github Works — Professional Portfolio (30 Repos)

> **Owner:** Gourab775 | **Excluded:** `priv` | **All repos professional, modular, Vercel live demos, Git-connected**

## New Category Structure (Shuffled as Requested)

Requested: `All, E-Commerce, Brand, Landing Pages, Web Apps, Tools`

```
Github_Works/
├── E-Commerce (5)/
│   ├── toonhub-collection          # was 3d-collection — 3D Commerce
│   ├── amber-skincare              # kept
│   ├── closet-studio               # was closet-e-commerce
│   ├── flavorbite-menu             # was qr-menu-app
│   └── flavorbite-dashboard        # was qr-menu-app-dashboard
├── Brand (5)/
│   ├── finasyt-interactive         # kept
│   ├── hously-architecture         # was hously-modern-architecture
│   ├── agency-website              # kept
│   ├── retro-finesyt               # kept
│   └── revolvyn-platform           # was REVOLVYN
├── Landing Pages (7)/
│   ├── turbo-930-showcase          # was 3d-car-scroll-website
│   ├── verdana-oasis               # was 3d-grass
│   ├── aethon-helmet               # was interactive-3d-helmet
│   ├── aqua-circle-3d              # was vary-circle-of-water-3d-website
│   ├── porsche-gt3                 # was vary-porsche-gt3
│   ├── robot-showcase              # was robot-temp
│   └── video-expansion             # kept
├── Web Apps (6)/
│   ├── after-sales-workspace       # was after-sales-assistant
│   ├── chat-workspace              # was ai-chat-assistant
│   ├── inbox-workspace             # was email-assistant-agent
│   ├── fitness-platform            # was fitness-app
│   ├── horizon-platform            # was horizon-site
│   └── quiz-workspace              # was quiz-starter-node
└── Tools (7)/
    ├── content-workspace           # was content-creator-agent
    ├── csv-workspace               # was csv-analyze-agent
    ├── file-workspace              # was multimodal-file-assistant-agent
    ├── content-quality-workspace   # was ai-slop
    ├── trends-workspace            # was ai-trends-scheduled-summary
    ├── campaign-workspace          # was marketing-campaign
    └── product-workspace           # was product-planner
```

> **All** is virtual filter in Works page (shows all 30).

## GitHub Professional Renames (25)

All via `gh api PATCH repos/Gourab775/<old> -f name="<new>"` (redirects preserved)

| Old | New | Vercel |
|-----|-----|--------|
| 3d-car-scroll-website | turbo-930-showcase | https://turbo-930-showcase.vercel.app |
| 3d-collection | toonhub-collection | https://toonhub-collection.vercel.app |
| 3d-grass | verdana-oasis | https://verdana-oasis.vercel.app |
| ... | ... | ... (see 30 in Works) |

All `origin` remotes updated: `git remote set-url origin https://github.com/Gourab775/<new>.git` — verified `30/30` connected.

## Works Page

- `src/data/projects.js:1` — 30 projects, `category` = one of `E-Commerce|Brand|Landing Pages|Web Apps|Tools`, `liveUrl` = Vercel professional, `githubUrl` = new GitHub
- `src/context/EditorContext.jsx:7` — `STORAGE_KEY = 'works-portfolio-data-v2'` (forces reload, categories derived from projects → `All` + 5)
- `src/components/WorksSection.jsx:9` — filter `All` shows all, others filter by category
- Build: `vite build` ✓ 41 modules, 227KB

## Verification

```bash
# Github_Works
ls Github_Works/E-Commerce # 5, Brand 5, Landing Pages 7, Web Apps 6, Tools 7
git -C Github_Works/E-Commerce/toonhub-collection remote -v # https://github.com/Gourab775/toonhub-collection.git

# Works
npm run build  # ✓
# README Live Demo
grep vercel.app Github_Works/*/README.md # 30/30 pass
```

*Clean system — no `01-...` old folders, no `priv`, no `AI` standalone, all Vercel live.*
