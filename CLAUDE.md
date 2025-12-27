# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monster Battle game for a loyalty program - a Summoners War-style gacha game with turn-based combat. Built with React frontend (PixiJS for battle animations) and Node.js/Express backend.

**Architecture**: Monorepo with two applications:
- `monster-battle-client/` - React + TypeScript + Vite + PixiJS + Zustand
- `monster-battle-server/` - Express + TypeScript + Sequelize + PostgreSQL

## Commands

### Frontend (monster-battle-client/)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint checks
npm run preview  # Preview production build
```

### Backend (monster-battle-server/)
```bash
npm run dev      # nodemon + ts-node (auto-reload, port 3001)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled app
```

## Core Architecture

### Battle System (State Machine Pattern)
Location: `monster-battle-client/src/game/battle/`

**BattleEngine.ts** manages 9 phases:
`initialization → tick → turn_start → action_selection → action_execution → effect_resolution → turn_end → victory_check → battle_end`

**ATB System**: Attack Bar fills at 7% × monster speed per tick. Monster acts when bar reaches 100%.

**Damage Formula**:
```
Raw Damage = ATK × Multiplier × (1 + SkillUpBonus)
Defense Reduction = 1000 / (1140 + 3.5 × DEF)
Final Damage = Raw × DefReduction × CritModifier × ElementModifier
```

**Element Advantages** (1.15x damage):
- Fire → Wind → Water → Fire (triangle)
- Light ↔ Dark (mutual advantage)

### State Management (Zustand)
Location: `monster-battle-client/src/store/`

- `usePlayerStore` - Player profile, monsters, runes, resources (persisted)
- `useBattleStore` - Battle state, engine integration, speed control
- `useGachaStore` - Banners, pity states, pull execution

### Animation System
Location: `monster-battle-client/src/utils/animations.ts`

Utilities: `tween()`, `shakeAnimation()`, `flashAnimation()`, `bounceAnimation()`, `attackAnimation()`, `deathAnimation()`, `createDamageNumber()`, `createSkillEffect()`

### Gacha System (Server-side)
Location: `monster-battle-server/src/services/GachaService.ts`

- **Rates**: SSR 0.8%, SR 8%, Rare 60%, Common 31.2%
- **Pity**: Soft pity at 60 pulls (+2.5%/pull), hard pity at 70
- Uses `crypto.randomBytes()` for secure RNG

### API Routes
Base: `/api/v1`
- `/auth` - JWT authentication (login, signup, refresh)
- `/player` - Profile and inventory
- `/gacha` - Summon system with pity
- `/monsters` - Monster data

## Type System

### Key Interfaces
- `BattleMonster`, `BattleState`, `BattleAction`, `BattleSkill`
- `MonsterTemplate`, `PlayerMonster`, `SkillTemplate`
- `Element`: `'fire' | 'water' | 'wind' | 'light' | 'dark'`
- `Rarity`: `'common' | 'rare' | 'sr' | 'ssr'`
- `Player`, `PlayerRune`, `TeamPreset`

### TypeScript Configuration
Both apps use strict mode with `verbatimModuleSyntax` enabled - use `import type` for type-only imports.

## Data

### Monster Templates
Location: `monster-battle-client/src/data/monsters.ts`

20 monsters defined: 5 SSR, 9 SR, 5 Rare across 5 elements with full skill definitions.

## Development Notes

- Client runs on port 5173, server on port 3001
- Mock JWT auth enabled for development (`monster-battle-server/src/middleware/auth.ts`)
- Battle speed control: 1x, 2x, 3x in `useBattleStore`
- PixiJS 8.x used for canvas-based battle rendering
