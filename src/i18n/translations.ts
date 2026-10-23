import type { NestedKeysStripped } from '@payloadcms/translations'

// Texts of our own admin components, merged into Payload's translations (payload.config.ts) and
// read with `useTranslation<Translations, TranslationKeys>()`. Field labels don't live here: the
// schema declares them inline as `{ en, de }`.

const en = {
  flow: {
    blockImage: 'Image',
    blockText: 'Text',
    blockNews: 'News',
    blockTopic: 'Topic',
    sizeFull: 'Full',

    modifierClear: 'New row',
    modifierRight: 'Right',
    modifierCenter: 'Center',
    modifierCrop: 'Crop',
    modifierTopmargin: 'Space above',
    modifierSeparator: 'Divider',
    hintClear: 'Start a new row with this block',
    hintRight: 'Push to the right edge of the row',
    hintCenter: 'Center the content in its cell',
    hintCrop: 'Fixed height, image cropped to fill (1/4, 1/3 and 1/2 only)',
    hintTopmargin: 'Extra space above',
    hintSeparator: 'Full-width divider line above; starts a new section',

    modeVisual: 'Visual',
    modeList: 'List',
    deviceDesktop: 'Desktop',
    deviceMobile: 'Mobile',
    readOnly: 'Read only',
    usage: 'Click a block to change its layout · drag to reorder · double-click to edit its content',
    empty: 'The flow is empty. Add images or text below.',
    offstage:
      'Not shown on the website: its flow skips news references, so they take no place in the grid.',
    addAfterSelected: 'Add after the selected block:',
    addAtEnd: 'Add at the end:',
    addImages: '+ Images',
    addText: '+ Text',
    addTopic: '+ Topic',
    projectImages:
      'Images of this project not in the flow ({{number}}) · click to add, or drag into place',

    editBlock: 'Edit {{block}}',
    editAnyBlock: 'Edit block',
    done: 'Done',
    edit: 'Edit',
    remove: 'Remove',
    loading: 'Loading…',
    notFound: 'not found',
    emptyText: 'Empty text block. Double-click to write.',
    noImage: 'No image selected',
    imageNotFound: 'Image not found',
    topicHasNoImage: 'Topic has no image',
    topicNotFound: 'Topic not found',
    newsHasNoImage: 'News item has no image',
    newsNotFound: 'News item not found',

    width: 'Width',
    narrower: 'Narrower (−)',
    wider: 'Wider (+)',
    moveEarlier: 'Move earlier (Alt+←)',
    moveLater: 'Move later (Alt+→)',
    editContent: 'Edit content (Enter)',
    removeWithKey: 'Remove (Delete)',
  },
  categories: {
    loading: 'Loading categories…',
    loadFailed: 'The categories could not be loaded.',
    empty: 'No categories yet.',
    edit: 'Edit categories',
    childrenOnly: 'Only categories within a group can be selected, not the groups themselves.',
  },
  map: {
    loading: 'Loading map…',
    pick: 'Click the map to set the location.',
    longitude: 'Longitude',
    latitude: 'Latitude',
  },
  excursions: {
    unscheduledDay: 'Not scheduled yet',
    untitledStop: 'Untitled stop',
    invalidSlug: 'Use lower-case letters, digits and single hyphens only, e.g. berlin-2026.',
    invalidTime: 'Enter the time as HH:mm, e.g. 09:30.',
    duplicateDate: 'Two days have the same date ({{date}}).',
  },
}

const de: typeof en = {
  flow: {
    blockImage: 'Bild',
    blockText: 'Text',
    blockNews: 'News',
    blockTopic: 'Thema',
    sizeFull: 'Voll',

    modifierClear: 'Neue Zeile',
    modifierRight: 'Rechtsbündig',
    modifierCenter: 'Zentriert',
    modifierCrop: 'Zuschneiden',
    modifierTopmargin: 'Abstand oben',
    modifierSeparator: 'Trennlinie',
    hintClear: 'Mit diesem Block eine neue Zeile beginnen',
    hintRight: 'An den rechten Rand der Zeile schieben',
    hintCenter: 'Inhalt in der Zelle zentrieren',
    hintCrop: 'Feste Höhe, Bild wird passend zugeschnitten (nur 1/4, 1/3 und 1/2)',
    hintTopmargin: 'Zusätzlicher Abstand oben',
    hintSeparator: 'Trennlinie über die volle Breite darüber; beginnt einen neuen Abschnitt',

    modeVisual: 'Visuell',
    modeList: 'Liste',
    deviceDesktop: 'Desktop',
    deviceMobile: 'Mobil',
    readOnly: 'Schreibgeschützt',
    usage:
      'Block anklicken, um das Layout zu ändern · ziehen zum Verschieben · Doppelklick, um den Inhalt zu bearbeiten',
    empty: 'Der Flow ist leer. Unten Bilder oder Text hinzufügen.',
    offstage:
      'Nicht auf der Website sichtbar: Die Website überspringt News-Verweise im Flow, sie belegen keinen Platz im Raster.',
    addAfterSelected: 'Nach dem ausgewählten Block einfügen:',
    addAtEnd: 'Am Ende einfügen:',
    addImages: '+ Bilder',
    addText: '+ Text',
    addTopic: '+ Thema',
    projectImages:
      'Bilder dieses Projekts, die noch nicht im Flow sind ({{number}}) · anklicken zum Einfügen oder an die gewünschte Stelle ziehen',

    editBlock: '{{block}} bearbeiten',
    editAnyBlock: 'Block bearbeiten',
    done: 'Fertig',
    edit: 'Bearbeiten',
    remove: 'Entfernen',
    loading: 'Lädt…',
    notFound: 'nicht gefunden',
    emptyText: 'Leerer Textblock. Doppelklick zum Schreiben.',
    noImage: 'Kein Bild ausgewählt',
    imageNotFound: 'Bild nicht gefunden',
    topicHasNoImage: 'Thema hat kein Bild',
    topicNotFound: 'Thema nicht gefunden',
    newsHasNoImage: 'News hat kein Bild',
    newsNotFound: 'News nicht gefunden',

    width: 'Breite',
    narrower: 'Schmaler (−)',
    wider: 'Breiter (+)',
    moveEarlier: 'Nach vorn (Alt+←)',
    moveLater: 'Nach hinten (Alt+→)',
    editContent: 'Inhalt bearbeiten (Enter)',
    removeWithKey: 'Entfernen (Entf)',
  },
  categories: {
    loading: 'Kategorien werden geladen…',
    loadFailed: 'Die Kategorien konnten nicht geladen werden.',
    empty: 'Noch keine Kategorien vorhanden.',
    edit: 'Kategorien bearbeiten',
    childrenOnly: 'Auswählbar sind nur Kategorien innerhalb einer Gruppe, nicht die Gruppen selbst.',
  },
  map: {
    loading: 'Karte wird geladen…',
    pick: 'In die Karte klicken, um den Standort zu setzen.',
    longitude: 'Längengrad',
    latitude: 'Breitengrad',
  },
  excursions: {
    unscheduledDay: 'Noch nicht eingeplant',
    untitledStop: 'Station ohne Titel',
    invalidSlug: 'Nur Kleinbuchstaben, Ziffern und einzelne Bindestriche verwenden, z. B. berlin-2026.',
    invalidTime: 'Uhrzeit als HH:mm eingeben, z. B. 09:30.',
    duplicateDate: 'Zwei Tage haben dasselbe Datum ({{date}}).',
  },
}

export const translations = { en, de }

export type Translations = typeof en
export type TranslationKeys = NestedKeysStripped<Translations>
