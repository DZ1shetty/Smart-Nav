# Design System: Campus Navigator

This document serves as the single source of truth for the **Campus Navigator** web application's design language, visual identity, and token system, inspired by Google's premium **Stitch** design principles.

---

## 1. Visual Theme & Atmosphere
The application embodies a **High-Tech Cyber-Blueprint** aesthetic. It blends the technical structure of blueprints (representing engineering and navigation) with high-fidelity, polished, modern interfaces (representing advanced technology and modern software).

* **Mood**: Airy yet dense with technical details, premium, and alive.
* **Layout feel**: Floating modules, glassmorphic panels, and neon-wireframe outlines.
* **Density**: Moderate-high data density with clean visual breathing room (ample margins, balanced whitespace, and crisp grid alignment).

---

## 2. Color Palette & Roles

Color is treated as a core functional element rather than just a styling choice. Every hex value corresponds to a specific semantic role:

| Color Role | Descriptive Name | Hex Code | Functional Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Back** | Deep Ink-Black | `#070707` | Base background layer for the entire application. |
| **Surface/Card** | Glassmorphic Slate | `#0a0a0a` / `#0d0d0d` | Elevated containers, cards, and modal backdrops. |
| **Accent / Link** | Electric Azure | `#3b82f6` | Primary buttons, active routes, navigation paths, and glowing markers. |
| **Border / Wireframe** | Whisper-Thin White | `rgba(255, 255, 255, 0.05)` | Micro-borders (1px) dividing content without solid separation. |
| **State: Success** | Radiant Emerald | `#10b981` | Open statuses, dynamic presence indicators (In Cabin), and online database indicators. |
| **State: Warning** | Neon Amber | `#f59e0b` | Busy states, classrooms temporarily locked/occupied. |
| **State: Danger** | Crimson Flare | `#ef4444` | Closed states, profs Out of Campus, and error notifications. |

---

## 3. Typography Rules

The typography system relies on a high-contrast combination of a futuristic technical font and an organic, readable sans-serif:

* **Header Font**: **Orbitron** (Google Fonts)
  * *Weights*: Bold (`700`), Black (`900`)
  * *Usage*: Capitalized headings, buttons, tags, routes, and layout labels.
  * *Character*: High letter-spacing (`tracking-wider` / `0.1em` to `0.2em`) to enhance the technical-cyber HUD feeling.
* **Body Font**: **Space Grotesk** / **Inter** (Google Fonts)
  * *Weights*: Light (`300`), Medium (`500`), Bold (`700`)
  * *Usage*: Room descriptions, navigation instructions, faculty bios, and list inputs.
  * *Character*: High readability, tight tracking for a crisp layout feel.

---

## 4. Component Stylings

All UI elements strictly align to these pre-defined visual tokens:

* **Buttons**:
  * *Shape*: Pill-shaped (`rounded-xl` or `rounded-2xl`) for interaction control; circle-enclosed icons (`rounded-full`) for utility triggers.
  * *Color*: High-contrast translucent backgrounds (`bg-blue-500/10`) with glowing outer borders, or solid Electric Azure (`bg-blue-500`) with intense shadows (`shadow-blue-500/20`) for active primary prompts.
* **Cards & Containers**:
  * *Shape*: Generously curved corners (`rounded-3xl` / `24px` radius) to contrast with sharp technical typography.
  * *Background*: Translucent dark slate with a heavy glassmorphic backdrop filter (`backdrop-blur-xl`).
  * *Elevation*: Supported by massive, whisper-soft diffused shadows (`shadow-2xl`) and ambient background aura glows (subtle radial gradients).
* **Inputs & Forms**:
  * *Style*: Thin borders (`border-2 border-blue-500/20`) that glow dynamically (`focus:border-blue-500`) on interaction.
  * *Background*: Inner recessed dark fields (`bg-black/5` or `bg-white/5` with `shadow-inner`) to create an embossed, high-tech control panel feel.

---

## 5. Layout & Spacing Principles

* **Grid Strategy**: Rigid, pixel-perfect alignment. All custom control components align to a modular columns structure.
* **Aura Layering**: High-tech background glow layers. Subtle, blurry radial gradients (`bg-blue-500/20` with `blur-[100px]`) are used beneath modal overlays to frame and highlight the primary active module.
* **Blueprint Accents**: A repeating fine-mesh blueprint grid (`blueprint-grid`) set to a very low opacity (`opacity-[0.05]`) sits on the canvas layer, creating structural texture and anchoring the map coordinates visually.
