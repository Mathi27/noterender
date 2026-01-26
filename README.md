<p align="center">
  <img src="assets/note-render.png" alt="NoteRender logo" width="300">
</p>

<h1 align="center">NoteRender</h1>

<p align="center">
  <strong>Local-first engine for rendering Jupyter notebooks into publication-ready PDFs.</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

**NoteRender** is a deterministic, local-first rendering engine that converts Jupyter notebooks (`.ipynb`) into clean, professional PDF documents.

It is built for:
- students preparing academic submissions,
- engineers exporting technical reports,
- researchers publishing notebook-based work,
- and teams that need **reproducible, template-driven PDFs**.

Unlike browser-based or cloud converters, NoteRender runs entirely **locally**, providing full control over formatting, privacy, and output consistency.

---

## Features

- Convert `.ipynb` notebooks directly to PDF
- Consistent layout with configurable templates
- Automatic page numbers, headers, and footers
- Academic and college-friendly formatting
- Local-first execution (no cloud dependency)
- Deterministic output (same input → same PDF)
- CLI-first and scriptable
- Minimal configuration, explicit behavior

---

## Why NoteRender?

Most notebook-to-PDF workflows are:
- fragile,
- browser-dependent,
- or difficult to customize for academic standards.

**NoteRender** prioritizes:
- reliability over magic,
- explicit configuration over hidden defaults,
- boring, predictable output (this is a feature).

---

### Development is Paused | Open for contributions.

### Colab to PDF – Planned Features by 2026 FEB 

| #  | Feature Title                          | Description                                                                 | Status           |
|----|----------------------------------------|-----------------------------------------------------------------------------|------------------|
| 1  | Paper Size & Orientation               | Convert IPYNB to PDF with selectable paper size (A4, A3, Letter) and orientation (Portrait/Landscape). | Yet to be pushed |
| 2  | Custom Margins                         | Set top, bottom, left, and right margins for the output PDF.               | Yet to be pushed |
| 3  | PDF Styling Templates                  | Choose from predefined templates to control fonts, spacing, colors, and layout. | Yet to be pushed |
| 4  | Password-Protected PDF                | Encrypt the generated PDF with a user-defined password.                   | Yet to be pushed |
| 5  | Select Cells to Export                | Export only selected cells (by tag, index range, or checkbox UI).         | Yet to be pushed |
| 6  | Hide / Show Code or Output            | Option to hide code cells, hide outputs, or export only outputs.           | Yet to be pushed |
| 7  | Add Header & Footer                   | Add custom header/footer with title, author name, date, and page numbers. | Yet to be pushed |
| 8  | Table of Contents Generation          | Auto-generate a clickable TOC from markdown headings.                      | Yet to be pushed |
| 9  | Syntax Highlighting Themes            | Choose code syntax highlighting themes (light/dark/monokai, etc.).         | Yet to be pushed |
| 10 | Embed Fonts & Offline-Safe PDF        | Embed fonts to ensure the PDF renders correctly on any device.            | Yet to be pushed |
| 11 | Watermark Support                    | Add text or image watermark (e.g., “Draft”, “Confidential”).              | Yet to be pushed |
| 12 | Batch Conversion                     | Convert multiple notebooks into PDFs in one go or zip output.             | Yet to be pushed |
| 13 | CLI Version                           | Command-line tool to convert IPYNB to PDF locally (e.g., `colab2pdf file.ipynb`). | Yet to be pushed |
| 14 | GitHub Actions Support               | GitHub Action to auto-convert notebooks in a repo to PDFs on push or release. | Yet to be pushed |
| 15 | Theme Marketplace                    | Community-driven gallery to browse, install, and share PDF templates.    | Yet to be pushed |
| 16 | Metadata Editor                     | Edit PDF metadata such as title, author, subject, keywords, and creation date. | Yet to be pushed |
