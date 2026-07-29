---
permalink: /privacy/
title: "Better Gemini Privacy Policy"
author_profile: false
---

# Better Gemini Privacy Policy

Last updated: May 28, 2026

Better Gemini is an independent Microsoft Edge extension for `https://gemini.google.com/*`. It is not affiliated with, endorsed by, or sponsored by Google or Gemini.

## Purpose

Better Gemini adds local timestamp labels and lightweight reading actions to Gemini conversations on the web. It can display message timestamps, date separators, copy the currently visible chat as Markdown when requested, scroll to the latest visible message, and clear the current conversation's local timestamp cache.

## Data Accessed

The extension accesses Gemini page content locally in the user's browser so it can identify visible messages and display timestamp labels. For best-effort historical timestamp backfill, it may inspect Gemini page response text inside the active Gemini page to find timestamp metadata.

When the user clicks "Copy visible chat as Markdown", the extension reads the currently visible Gemini conversation content from the page and generates Markdown locally in the browser.

## Data Stored

Better Gemini stores extension settings and local timestamp cache entries in browser storage. Cache entries may include timestamp values, message role metadata, message IDs when present, and short hashed text fingerprints used for local matching.

The extension does not persist full message text in extension storage.

## Clipboard

When the user clicks "Copy visible chat as Markdown", Better Gemini writes the generated Markdown text to the clipboard. This action happens only after the user clicks the popup button.

## Data Sharing

Better Gemini does not upload chat content, timestamp cache data, settings, analytics, or personal information to a developer server. It does not sell, rent, or share user data with third parties.

## Remote Code

Better Gemini does not load or execute remotely hosted JavaScript or WebAssembly. All extension code is included in the submitted extension package.

## User Controls

Users can disable timestamp display from the popup, clear the current conversation's local timestamp cache, or remove the extension from Microsoft Edge at any time.

## Contact

For privacy questions, contact: `pzy2000@sjtu.edu.cn`
