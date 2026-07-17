# RodSchema

An interactive, canvas-based developer tool for visually architecting database schemas and instantly generating production-ready ORM and SQL code.

Designed for speed and power, this tool eliminates manual schema writing by turning a visual entity-relationship diagram into valid, clean code — entirely in the browser, with no account or server required.

---

## ⚙️ The Architecture & Tech Stack

This project is a fully client-side single-page application. There's no backend — all schema design, code generation, and persistence happen locally in the browser, and projects are shared via export rather than accounts or server storage.

* **Frontend:** React (powered by Vite) for incredibly fast HMR and lightweight bundles.
* **Styling:** Tailwind CSS + shadcn/ui for a clean, developer-focused workspace UI.
* **Canvas & Graph:** [React Flow](https://reactflow.dev/) powers the node/edge graph — draggable table nodes, connection handles, panning, and zooming — with custom node types and validation-aware connection rules layered on top.
* **Compiler Engine:** A framework-agnostic set of pure TypeScript functions (parser, generators, validator) that turn the visual graph's JSON representation into SQL, Prisma, or SQLAlchemy — runs entirely client-side, unit-tested independently of any UI.
* **Persistence:** IndexedDB (via `idb`) for saving multiple named projects locally, with JSON export/import as the mechanism for backup and sharing.

---

## 🛠️ Key Technical Challenges Solved

### 1. Custom Graph Experience on React Flow

Rather than reinventing node dragging and edge routing, the interactive workspace builds on React Flow's battle-tested primitives, extended with:

* Custom table-node components rendering live field lists (name, type, nullability, keys).
* Validation-aware connection rules — a relationship can be rejected at the moment a user draws it if the underlying types are incompatible.
* Live-sync between the visual graph and the generated code panel as the graph changes.

### 2. Schema AST (Abstract Syntax Tree) Compiler

The core engine treats the visual layout as a structured data graph. A pure-function compiler maps this graph into multiple developer targets:

* Generates clean, native **SQL DDL** scripts (including strict foreign key constraints and cascade rules).
* Compiles structured layout JSON into fully typed **Prisma Schemas** or Python **SQLAlchemy Models**.

### 3. Real-Time Relationship Validation

Built-in linting prevents bad database design before it happens. The app analyzes table connections on the fly to flag:

* Circular dependencies or infinite foreign key loops.
* Data type mismatches between a Primary Key and a Foreign Key.

---

## 💾 Core Data Structures

The application represents the canvas state as a unified JSON object, making it easy to save, export, or parse:

```json
{
  "tables": [
    {
      "id": "tbl_users",
      "name": "users",
      "position": { "x": 120, "y": 250 },
      "fields": [
        { "name": "id", "type": "UUID", "isPk": true },
        { "name": "email", "type": "VARCHAR", "isUnique": true }
      ]
    }
  ],
  "relations": [
    {
      "id": "rel_1",
      "from": { "tableId": "tbl_users", "field": "id" },
      "to": { "tableId": "tbl_posts", "field": "user_id" },
      "type": "one-to-many"
    }
  ]
}
```

---

## 🚀 Features

* **Interactive Node Architecture:** Drag, drop, create, and edit database tables on an infinite grid canvas.
* **Split-Screen Live Code Preview:** Watch your SQL or ORM schema update instantly side-by-side as you tweak the visual layout.
* **Smart Canvas Utilities:** Zoom in/out, pan, and keyboard controls for navigating large diagrams.
* **Local Project Storage:** Save and switch between multiple named schema projects, stored locally via IndexedDB — no account needed.
* **One-Click Export:** Download the schema as a standalone JSON state file, raw SQL, or your preferred ORM config — the primary way to back up or share a project.

---

## 🚶‍♂️ Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rodschema.git
cd rodschema
```

2. Install dependencies and run:
```bash
npm install
npm run dev
```