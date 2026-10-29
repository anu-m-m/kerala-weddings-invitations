# AGENTS.md

## What this is
A static, single-page Indian wedding invitation (plain HTML/CSS/JS, no framework, no build, no dependencies). Deployed on Netlify with `publish = "."`.

## Architecture
- `js/config.js` defines `window.WEDDING`, the **single source of truth for all content** (couple, families, story slides, events, venues, RSVP/WhatsApp, music). It is loaded as a classic script before `main.js`.
- `js/main.js` is one IIFE that reads `WEDDING` and renders or wires everything. The sections are, in order: image helper, date helpers, `[data-bind]` text bindings, the FX canvas, sound effects (shared `AudioContext`), the envelope intro, the countdown, families, the carousel, calendar/maps helpers, events, venue, RSVP → WhatsApp, music, and reveal-on-scroll/toast.
- `index.html` holds the static skeleton plus the SVG `<symbol>`s (`#flourish`, `#corner`, `#lotus`) that are reused through `<use>`. Families, slides, event cards, RSVP event checkboxes and venue notes are generated from config.
- `css/style.css` is organised by section. The design tokens are CSS variables in `:root`.

## Conventions
- Add new content to `config.js` rather than hard-coding it in HTML. Escape any interpolated config text with `esc()`.
- Load images through `setImg()` / `imgSrc()`. Over HTTP(S) these use the Netlify Image CDN (`/.netlify/images?url=…&fm=webp`), fall back to the original file on error, and use originals under `file://`.
- All times are ISO strings with an offset and are formatted in `Asia/Kolkata`.
- Every button must do something real. There are no placeholders.

## Non-obvious decisions
- **No nav bar:** the page has no header or menu by design; it is one continuous scroll.
- **Envelope:** the entrance and opening are staged by classes that `main.js` adds on timers (`is-press` → `is-seal` → `is-open` → `is-rise` → `is-drop` → `is-exit` → `is-gone`), with matching CSS in the envelope section. The seal is two clipped halves that fall apart. The page content behind the envelope is `inert` until the seal is clicked, and Escape also opens it. A deep link (for example `/#rsvp`) skips the envelope.
- **FX:** a single `<canvas>` draws gold dust, petals and confetti. It stops its rAF loop when idle or hidden, and does nothing under `prefers-reduced-motion`.
- **Sound:** opening the seal plays a wax crack, a paper rustle and a bell shimmer, synthesised with Web Audio. They are started inside the click so mobile browsers allow audio, and the music synth reuses the same `AudioContext`.
- **Music:** this starts on open (`playOnOpen`) and plays `music.src` if it exists. If the file is missing or fails to load, it falls back to a Web Audio synth (tanpura drone with a Bhupali melody) so the toggle always works.
- **RSVP:** the form builds a `wa.me/<number>?text=` URL. `window.open` is called without `noopener` because that flag makes it return null, and the code falls back to `location.href` when pop-ups are blocked.
- **Calendar:** Google Calendar links use UTC stamps. `.ics` files are generated client-side as Blobs and include a 1-day reminder.
- **Images:** the images in `img/` were AI-generated stand-ins, and the couple is expected to replace them.
