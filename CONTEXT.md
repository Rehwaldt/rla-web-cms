# Domain glossary

Terms used across collections, code and docs. When a name here fits, use it; when a new concept
appears, add it here first.

The admin UI is bilingual. Each term notes the word the German admin uses for it (`de:`); German
labels use these words so that one concept never gets two German names.

## Content

- **Project** (de: *Projekt*): a piece of landscape-architecture work (built, planned, or a
  competition entry). Identified internally by Payload's id; carries a **project code**.
- **Project code** (de: *Projektkürzel*): short, stable code shared across RLA systems (e.g.
  `BUG`) and used in website URLs. Unique, but may be empty for old entries that never got one.
- **Project type** (de: *Projektart*): `competition` (de: *Wettbewerb*, a competition entry),
  `object` (de: *Objektplanung*, a built or buildable design) or `concept` (de: *Konzept*, a study
  or concept plan).
- **Ongoing** (de: *Laufend*): a project still in planning or under construction. Its
  **completion year** (de: *Fertigstellungsjahr*) is the planned year.
- **Project category** (de: *Projektkategorie*): node in a two-level tree. Top-level **groups**
  (de: *Gruppe*) sit in one of four **menu columns** (de: *Menüspalte*) of the project filter;
  child categories are what projects are tagged with.
- **Project gallery** (de: *Projektgalerie*): the curated, ordered list of featured projects the
  projects page shows by default. One list per language.
- **Similar projects** (de: *Ähnliche Projekte*): symmetric relation between projects. Stored on
  one side; the other side sees it as "listed as similar by" (de: *Als ähnlich verknüpft von*).
- **Topic** (de: *Thema*): a thematic focus area (e.g. "Water in the city") grouping projects, with
  its own flow.
- **News** (de: *News*): dated announcement.
- **Award** (de: *Auszeichnung*): prize received, with year and optional month.
- **Publication** (de: *Publikation*): a book, or a piece published in a journal or in a book.
- **Job** (de: *Stellenangebot*): open position at an office.
- **Page** (de: *Seite*): stand-alone website page (office profile, contact, imprint, …) fetched
  by its **key** (de: *Seitenschlüssel*).
- **Employee** (de: *Mitarbeitende*): public team profile.
- **Office** (de: *Büro*): an office location (Dresden, Berlin, Prague, Beijing, …).

## Presentation

- **Flow** (de: *Flow*): a grid of blocks (image, text, news reference, topic reference). Each
  block has a **size** (de: *Breite*; columns out of 12) and **modifiers** (de: *Optionen*:
  `clear` *Neue Zeile*, `right` *Rechtsbündig*, `center` *Zentriert*, `crop` *Zuschneiden*,
  `topmargin` *Abstand oben*; text blocks also `separator` *Trennlinie*).
- **Hero image** (de: *Titelbild*): large image at the top of a project page. **Preview image**
  (de: *Vorschaubild*): the tile image in listings.
- **Credit** (de: *Copyright*): photographer or copyright holder of a media item.

## Publishing

- **Published / draft**: Payload's draft status. Drafts are invisible to the website. (Payload's
  own German UI says *Veröffentlicht* / *Entwurf*.)
- **Listed in** (`visibleIn`, de: *Aufgeführt in*): the languages whose website lists a published
  entry. A published entry that isn't listed in a language is still reachable by direct link
  there.
- **Legacy id** (de: *Legacy ID*, left untranslated as developer information): id of the legacy
  record a document was imported from. Only the importer uses it.

## Minescapes (provisional)

Not modeled properly yet; these terms only fix the German labels until it is.

- **Mine** (de: *Bergbaustandort*): a mining site. **Site types**: open-cast mine (*Tagebau*),
  external dump (*Außenhalde*), underground mine (*Tiefbau*), quarry (*Steinbruch*), mountaintop
  removal (*Bergkuppenabbau*). **Status**: in use (*In Betrieb*), in revitalization (*In
  Rekultivierung*), revitalized (*Rekultiviert*).
- **Mine feature** (de: *Nachnutzung*): how a former mining site is used now, e.g. fishing.
