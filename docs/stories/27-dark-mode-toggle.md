# [27] Dark/Light Mode Toggle

## 🎯 Overview

**Feature**: Visual Comfort & Theme Preference  
**Goal**: Allow users to toggle between Light Mode (default) and Dark Mode to reduce eye strain and personalize their workspace.

## 👤 User Story
>
> **As a** Relationship Manager working long hours,  
> **I want** to easily toggle between a dark and light theme,  
> **So that** I can adjust the interface to my ambient lighting and personal preference for better readability.

## ✅ Acceptance Criteria

### Functionality

- [ ] **Toggle Switch**: A clear, accessible toggle button in the global header or settings menu.
- [ ] **Persistence**:
  - The chosen theme (Dark/Light) should persist across sessions (localStorage/cookie).
  - On first load, respect the user's system preference (`prefers-color-scheme`).
- [ ] **Instant Switch**: Changing the theme should update the UI immediately without reloading the page.

### Visual Design

- [ ] **Light Mode (Default)**:
  - Background: `#F8F9FA` / White
  - Text: Dark Navy / Slate
  - Borders: Light Gray
- [ ] **Dark Mode**:
  - Background: Deep Blue `#0A1628` / Slate `#1A202C`
  - Text: White / Light Gray
  - Cards: Semi-transparent dark glass or dark slate
  - Borders: Dark Gunmetal / White (10% opacity)
- [ ] **Icons**: Sun icon for Light Mode, Moon icon for Dark Mode.

### Technical Specs

- **State Management**: Use Zustand store/Theme Context to manage `theme` state ('light' | 'dark').
- **CSS Strategy**: Use Tailwind's `darkMode: 'class'` strategy.
- **Root Class**: Toggling should add/remove the `dark` class on the `<html>` or `<body>` element.
- **Tailwind Config**: Ensure all colors have `dark:` varianats defined.

## 🖼️ UI Concept

- **Location**: Top-right corner of the Dashboard Header, near the notifications bell.
- **Interaction**: Single click to flip state.
- **Transition**: Smooth color transition (e.g., `transition-colors duration-300`).

---
**Priority**: Medium (UX Enhancement)
**Theme**: "Day & Night"
