# Installation Guide

## Prerequisites

- Node.js 18+
- OpenClaw CLI installed and configured
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url> polyforge
cd polyforge
```

### 2. Install Dependencies

```bash
cd plugin
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Configure OpenClaw

Add PolyForge to your OpenClaw plugin configuration:

```json
{
  "plugins": {
    "polyforge": {
      "path": "/path/to/polyforge/plugin",
      "config": {
        "max_auto_iterations": 10,
        "preferred_language": "mixed",
        "research_depth": "standard"
      }
    }
  }
}
```

### 5. Setup Wizard (Optional)

Run the interactive setup wizard:

```bash
npx pf-setup
```

Options:
- `--list-presets` — Show available model presets
- `--check` — Verify configuration

## Verify Installation

```bash
# In OpenClaw CLI
/pf health
/pf status
```

## Configuration

See [Configuration Reference](../reference/configuration.md) for all available options.
