# 🪙 TipSplit — Premium Tip Pooling & Compliance Calculator

A modern, fast, and responsive web application built with **Astro**, **Tailwind CSS v4**, and **Vanilla JavaScript** to calculate and pool restaurant shift tips. It supports multiple split methods (equal, hours-based, and weighted role points) and performs live compliance checking against state-specific U.S. Department of Labor (DOL) FLSA guidelines.

---

## ✨ Features

- **📊 Dynamic Split Methodologies**:
  - **Equal Split**: Distribute tips equally among all team members.
  - **By Hours worked**: Distributes tips proportionally based on shift duration (hours worked).
  - **By Role Points**: Distribute tips based on weighted point systems per position (e.g., Servers get 10 points, Bartenders get 8 points, Bussers get 5 points).
- **⚖️ Real-Time Compliance Checking (August 2026 Rules)**:
  - Supports **Federal (FLSA Baseline)**, **California (CA Labor Code Section 351)**, **Texas**, **New York**, and **Florida** regulations.
  - Checks if **Back-of-House (BOH)** staff are included while a tip credit is claimed (a critical FLSA violation).
  - Validates and flags invalid inclusion of **Managers & Supervisors** (who are strictly prohibited from receiving pool tips under federal law).
  - Triggers interactive visual alerts (banners with status colors and icons) for compliance errors or warnings.
- **🎨 Premium Dark Theme & UX**:
  - Beautiful aesthetics powered by **Tailwind CSS v4** with a custom dark/gold color palette.
  - Smooth micro-animations (toast messages, accordion expansions, error shaking, fade-in tables).
  - **Quick presets** for rapid addition of common restaurant roles (Server, Bartender, Busser, Host, Food Runner, Barback) in role points mode.
  - Quick actions to **Copy Summary** to clipboard or **Print/Save as PDF** using customized print layouts.
- **♿ Fully Accessible & SEO Friendly**:
  - Custom keyboard navigation (arrow-key navigation for radio buttons).
  - Clear ARIA roles and labels, semantic HTML structure, and "Skip to Calculator" accessibility link.
  - Responsive layout optimized for mobile screens.
  - Comprehensive interactive **FAQ Section** matching search intent.
  - Structured **JSON-LD Schema** (FAQPage) to boost SEO search engine visibility.

---

## 📁 Project Structure

```text
/
├── public/                     # Static assets (favicons, manifest, etc.)
├── src/
│   ├── assets/                 # SVGs and static image files
│   ├── components/
│   │   └── Welcome.astro       # Astro-based starter component
│   ├── data/
│   │   └── legal-rules.json    # JSON compliance rules database for US & select states
│   ├── layouts/
│   │   └── Layout.astro        # Base layout with SEO headers, meta-tags & styles
│   ├── pages/
│   │   ├── 404.astro           # Custom styled 404 Error page
│   │   ├── 500.astro           # Custom styled 500 Error page
│   │   ├── contact.astro       # Contact form page with client-side validation
│   │   ├── index.astro         # Main calculator page (sections 1-4, result table, FAQ)
│   │   ├── privacy.astro       # Privacy Policy page
│   │   └── terms.astro         # Terms & Conditions page
│   ├── scripts/
│   │   └── calculator.js       # App state management, split calculation, compliance logic
│   └── styles/
│       └── global.css          # Tailwind CSS v4 variables, theme overrides, custom animations
├── astro.config.mjs            # Astro configuration
├── package.json                # Project dependencies and script runner configurations
└── tsconfig.json               # TypeScript configurations
```

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [Astro v7.2.0](https://astro.build)
- **Styling**: [Tailwind CSS v4.3.3](https://tailwindcss.com) (leveraging the new `@tailwindcss/vite` plugin and modern CSS variables theme)
- **Language**: Vanilla JavaScript (ES6 Modules) and TypeScript support
- **Engines**: Node.js `>= 22.12.0`

---

## 🚀 Commands & Development Setup

All commands are run from the project root:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs project dependencies |
| `npm run dev` | Starts the Astro development server locally |
| `astro dev --background` | Starts the dev server in the background |
| `astro dev stop` | Stops the background development server |
| `astro dev status` | Checks background server status |
| `astro dev logs` | Views logs for the background server |
| `npm run build` | Builds a production-ready bundle inside `./dist/` |
| `npm run preview` | Previews the build output locally |

---

## ⚖️ Legal Rules Database

The compliance engine queries `legal-rules.json` to flag issues. Here are the states configured and their operational guidelines (current as of **August 2026**):

| State/Jurisdiction | Allows Tip Credit | BOH Rule | Manager Rule | Key Compliance Note |
| :--- | :--- | :--- | :--- | :--- |
| **Federal (FLSA Baseline)** | Yes | No tip credit allowed | Never | BOH staff can only be included if the employer pays full minimum wage and takes NO tip credit. |
| **California (CA)** | No | Allowed | Never | Strictly prohibits tip credits. BOH employees can be included in a tip pool if in the chain of service. |
| **Texas (TX)** | Yes | No tip credit allowed | Never | BOH employees cannot participate in the tip pool if the employer claims a tip credit. |
| **New York (NY)** | Yes | Restricted | Never | Strict FOH-only rules. BOH staff generally excluded unless performing FOH-like direct customer services. |
| **Florida (FL)** | Yes | No tip credit allowed | Never | BOH staff cannot participate in the tip pool if the employer claims a tip credit. |

---

## 📄 License & Disclaimer

**Legal Disclaimer**: Tip pooling regulations are highly complex and differ by state and local jurisdiction. This tool calculates shares based on user inputs and public rules current as of August 2026. This does not constitute legal advice. Please consult an employment attorney or payroll expert to verify compliance before processing actual payroll.
