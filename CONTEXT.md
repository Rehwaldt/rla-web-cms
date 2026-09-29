# Domain glossary

Terms used across collections, code and docs. When a name here fits, use it; when a new concept
appears, add it here first.

## Content

- **Project**: a piece of landscape-architecture work (built, planned, or a competition entry).
  Identified internally by Payload's id; carries a **project code**.
- **Project code**: short, stable code shared across RLA systems (e.g. `BUG`) and used in website
  URLs. Unique, but may be empty for old entries that never got one.
- **Project type**: `competition` (a competition entry), `object` (object planning — a built or
  buildable design) or `concept` (a study or concept plan).
- **Ongoing**: a project still in planning or under construction. Its **completion year** is the
  planned year.
- **Project category**: node in a two-level tree. Top-level **groups** sit in one of four
  **menu columns** of the project filter; child categories are what projects are tagged with.
- **Project gallery**: the curated, ordered list of featured projects the projects page shows by
  default. One list per language.
- **Similar projects**: symmetric relation between projects. Stored on one side; the other side
  sees it as "listed as similar by".
- **Topic**: a thematic focus area (e.g. "Water in the city") grouping projects, with its own flow.
- **News**: dated announcement.
- **Award**: prize received, with year and optional month.
- **Publication**: a book, or a piece published in a journal or in a book.
- **Job**: open position at an office.
- **Page**: stand-alone website page (office profile, contact, imprint, …) fetched by its **key**.
- **Employee**: public team profile.
- **Office**: an office location (Dresden, Berlin, Prague, Beijing, …).

## Presentation

- **Flow**: a grid of blocks (image, text, news reference, topic reference). Each block has a
  **size** (columns out of 12) and **modifiers** (`clear`, `right`, `center`, `crop`,
  `topmargin`; text blocks also `separator`).
- **Hero image**: large image at the top of a project page. **Preview image**: the tile image in
  listings.

## Publishing

- **Published / draft**: Payload's draft status. Drafts are invisible to the website.
- **Listed in** (`visibleIn`): the languages whose website lists a published entry. A published
  entry that isn't listed in a language is still reachable by direct link there.
- **Legacy id**: id of the legacy record a document was imported from. Only the importer uses it.
