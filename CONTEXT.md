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
- **Project status** (de: *Projektstatus*): whether the work on a project is still running, for
  every project type: `completed` (de: *Abgeschlossen*; a submitted competition entry or a
  finished concept counts too) or `ongoing` (de: *Laufend*, in planning or under construction).
  The intranet's statuses (in planning, under construction, paused, cancelled) are to replace
  `ongoing` once its projects are migrated. Until a project is completed, its **completion year**
  (de: *Fertigstellungsjahr*) is the expected one.
- **Project category** (de: *Projektkategorie*): node in a two-level tree. Top-level **groups**
  (de: *Gruppe*) sit in one of four **menu columns** (de: *Menüspalte*) of the project filter;
  child categories are what projects are tagged with.
- **Project gallery** (de: *Projektgalerie*): the curated, ordered list of featured projects the
  projects page shows by default. One list per language.
- **Similar projects** (de: *Ähnliche Projekte*): symmetric relation between projects. Stored on
  one side; the other side sees it as "listed as similar by" (de: *Als ähnlich verknüpft von*).
- **Topic** (de: *Thema*): a thematic focus area (e.g. "Water in the city") grouping projects, with
  its own flow.
- **News** (de: *News*): dated announcement with a page of its own on the website (`/news/{id}`; the
  German navigation calls the section *aktuell*). Shaped like the intranet's news: hero image,
  preview image, **gallery** (de: *Galerie*; images below the text), categories and links.
- **News category** (de: *News-Kategorie*): what a news item is about (competition, people, project
  update, …). Editors add their own; a news item can have several.
- **Award** (de: *Auszeichnung*): prize received, with year and optional month.
- **Publication** (de: *Publikation*): a book, or a piece published in a journal or in a book.
- **Job** (de: *Stellenangebot*): open position at an office.
- **Page** (de: *Seite*): stand-alone website page (office profile, contact, imprint, …) fetched
  by its **key** (de: *Seitenschlüssel*). A page can carry a **timeline** (de: *Zeitleiste*):
  periods (de: *Zeitraum*) with an entry (de: *Eintrag*) each, shown in two columns, e.g. the
  founder's CV.
- **Employee** (de: *Mitarbeitende*): public team profile.
- **Office** (de: *Büro*): an office location (Dresden, Berlin, Prague, Beijing, …).
- **Excursion** (de: *Exkursion*): a trip of the office to visit built landscape architecture,
  e.g. "RLA Berlin" in September 2026, shown as a map with a timeline. Made of **days** (de:
  *Tage*), each with a date and its **stops** (de: *Stationen*) in running order. A day without a
  date is not scheduled yet (de: *noch nicht eingeplant*). A stop's **stop type** (de: *Art*) is a
  plain stop (*Station*, numbered on the website), an optional stop (*Optionale Station*), a break
  (*Pause*), a meeting point (*Treffpunkt*) or a meal (*Essen*).

## Presentation

- **Flow** (de: *Flow*): a grid of blocks. Each block has a **block type**, a **size** (de:
  *Breite*; columns out of 12) and **modifiers** (de: *Optionen*: `clear` *Neue Zeile*, `right`
  *Rechtsbündig*, `center` *Zentriert*, `topmargin` *Abstand oben*; `crop` *Zuschneiden* only on
  block types that show an image; `separator` *Trennlinie* only on text).
- **Block type** (de: *Blocktyp*): what a flow block shows. **Image** (de: *Bild*), **text** (de:
  *Text*) or **topic reference** (de: *Themen-Verweis*; an image tile with the topic's image and
  name).
- **Featured news** (de: *Ausgewählte News*): news items picked by hand for a page, per language
  and in order, shown in its news section (the front page's news row). Not part of the flow.
- **Featured projects** (de: *Ausgewählte Projekte*): projects picked by hand for a page, per
  language and in order, meant as the slides of the front page's **banner carousel** (de:
  *Banner-Karussell*): hero image, name, link. Not wired up yet: the carousel is still being built
  on the website. Not the **project gallery** (de: *Projektgalerie*), the projects page's default
  selection.
- **Caption** (de: *Bildunterschrift*): the line under an image. A media item can have one; in a
  flow the image block's own caption wins, then the media item's, then the image's project name.
  Project pages show none. An image block's
  **description** (de: *Beschreibung*) is a longer text below the image, shown on every page.
- **Hero image** (de: *Titelbild*): large image at the top of a project or news page. **Preview
  image** (de: *Vorschaubild*): the tile image in listings.
- **Credit** (de: *Copyright*): photographer or copyright holder of a media item.

## Publishing

- **Published / draft**: Payload's draft status. Drafts are invisible to the website. (Payload's
  own German UI says *Veröffentlicht* / *Entwurf*.)
- **Listed in** (`visibleIn`, de: *Aufgeführt in*): the languages whose website lists a published
  entry. A published entry that isn't listed in a language is still reachable by direct link
  there.
- **Legacy id** (de: *Legacy ID*, left untranslated as developer information): id of the legacy
  record a document was imported from. Only the importer uses it.

## Admin

- **Workspace** (de: *Arbeitsbereich*): a named selection of navigation sections for one kind of
  work, e.g. *Website* (daily editing) or *Minescapes* (mines and excursions). Each person picks
  their own; *All* (de: *Alle*) shows every section. A workspace only narrows what the navigation
  and the dashboard list; it grants or denies nothing. Workspaces may share sections.
  _Avoid_: mode, area
- **Navigation section** (de: *Rubrik*): a heading of the admin navigation grouping collections
  (Projects, News, Publications, …). _Avoid_: group (a project category group is something else)

## Minescapes (provisional)

Not modeled properly yet; these terms only fix the German labels until it is.

- **Mine** (de: *Bergbaustandort*): a mining site. **Site types**: open-cast mine (*Tagebau*),
  external dump (*Außenhalde*), underground mine (*Tiefbau*), quarry (*Steinbruch*), mountaintop
  removal (*Bergkuppenabbau*). **Status**: in use (*In Betrieb*), in revitalization (*In
  Rekultivierung*), revitalized (*Rekultiviert*).
- **Mine feature** (de: *Nachnutzung*): how a former mining site is used now, e.g. fishing.
