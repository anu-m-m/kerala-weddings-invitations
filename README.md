# Arjun & Meera — Indian Wedding Invitation

A premium, single-page wedding invitation website in ivory, champagne gold and soft blush florals. Guests break a wax seal to open an animated envelope, then scroll through the couple and their families, a live countdown, an "Our Story" photo carousel, cards for Mehendi, Haldi, Wedding and Reception, a venue map with directions and calendar links, and an RSVP form that sends a prefilled WhatsApp message.

Built with **plain HTML, CSS and JavaScript**. There's no framework, no build step and nothing to install.

## Features

- Animated envelope with a wax seal that cracks open, with a confetti burst on opening
- Gold dust, drifting petals and confetti drawn on one lightweight canvas (it pauses when the tab is hidden)
- Countdown to the wedding moment, set in India Standard Time
- Our Story carousel with buttons, dots, keyboard arrows, swipe, and an autoplay toggle
- Event cards, each with Google Maps directions, a Google Calendar link and an Apple/Outlook `.ics` download
- Venue section with an embedded Google Map, directions, and an all-events calendar file
- RSVP with accept/decline, a guest-count stepper, event selection, dietary preference and a note, all sent through WhatsApp
- Optional background music with a play/pause button. If no MP3 has been added yet, a soft built-in instrumental plays instead
- Responsive layout for phones (Android and iPhone, including the notch area), tablets and desktop
- Accessibility: keyboard focus styles, ARIA labels, live regions, skip link, and `prefers-reduced-motion` support (no particles, no autoplay, instant transitions)
- Performance: images are resized and converted to WebP through the Netlify Image CDN, images below the fold load lazily, and no JavaScript libraries are used

## Project structure

```
index.html        Page structure
css/style.css     All styling (colours are CSS variables at the top)
js/config.js      ← ALL your content: names, dates, events, venues, photos, WhatsApp, music
js/main.js        Behaviour (envelope, carousel, countdown, RSVP, music, effects)
img/              Photos
music/            Optional background MP3
netlify.toml      Hosting config (static, no build)
```

## Run it locally

Any static server works. From the project folder:

```bash
npx serve .            # or: python3 -m http.server 8080
# or, with Netlify features emulated (including the image CDN):
netlify dev
```

You can also open `index.html` directly in a browser. Images then load from their original files rather than through the CDN.

## Personalising your invitation

Almost everything is in **`js/config.js`**. Open it in a text editor; each section has a comment explaining it.

### Names and families
Edit `couple` (`bride`, `groom`, `initials` on the wax seal, `hashtag`, `tagline`) and `families.groom` / `families.bride` (name, parents, grandparents, home town, photo).

### Dates and countdown
- `weddingDateTime` is the moment the countdown counts down to. Use ISO format with the time-zone offset, for example `"2027-02-13T19:30:00+05:30"` (`+05:30` is India).
- `displayDate` and `city` are the text shown on the page.
- In `events`, each event has `start` and `end` in the same format. These drive the card dates, the Google Calendar links and the `.ics` files.

### Events
Each entry in `events` has a `name`, a `theme` (`mehendi`, `haldi`, `wedding` or `reception`, which controls the colour and icon), `dressCode`, `description` and `venueKey`. You can add or remove events, and the RSVP checkboxes update automatically.

### Venue and maps
In `venues`, each venue has a display `name`, an `address`, and a `mapQuery`, which is what Google Maps searches for. A full address or an exact place name works best. `mainVenueKey` picks the venue shown in the large map. `travelNotes` fills the notes under the venue.

### WhatsApp number
Set `rsvp.whatsappNumber` using **digits only**, starting with the country code and with no `+`, spaces or dashes.
For example, the Indian number +91 98765 43210 becomes `"919876543210"`. You can also change `deadline` and `maxGuests`.

### Photos
Replace the files in `img/` with your own and keep the same names, or point the paths in `config.js` at new files:

| File | Used for | Suggested shape |
|---|---|---|
| `img/couple.png` | Hero arch portrait and social share image | Portrait (about 3:4) |
| `img/groom.png`, `img/bride.png` | Family cards | Square, face centred |
| `img/story-1.png` … `story-4.png` | Our Story carousel | Landscape (about 16:9) |

JPG, PNG and WebP all work. Large originals are fine, because the Netlify Image CDN resizes them automatically. To add story slides, add photos and add entries to the `story` list. If you rename `couple.png`, also update the `og:image` tag in `index.html`.

### Music
Add `music/wedding-theme.mp3`, or change `music.src`. The music starts when the envelope is opened; set `music.playOnOpen: false` to wait for the guest to press the music button instead, or `music.enabled: false` to hide the button.

### Page title, colours and blessing
- The `<title>` and social-preview text are in the `<head>` of `index.html`. The title also updates itself from your names.
- The colours are CSS variables at the top of `css/style.css` (`--gold`, `--ivory`, `--maroon` and so on).
- The Ganesh blessing (`॥ श्री गणेशाय नमः ॥`) is in `index.html`. Change it or remove it as you like.

## Deploying

This folder deploys to Netlify as-is. `netlify.toml` publishes the root folder without a build step.
