Missing Podo: The Ankara Case — Implementation Plan

Scope of UI
- core investigation experience
- Keep components small, avoid unnecessary abstractions.
- One data hook, one normalizer, clear naming.



Product concept

Every record mentions one or more people. Podo is the subject. A "suspect" is anyone who appears alongside Podo across records (seen with, messaged, mentioned, tipped about).

Three pieces make the investigation story land:

1. Suspects panel: ranked list of people by number of co-occurrences with Podo. This is the "who looks most suspicious" answer.
2. Event feed: chronological list of all records involving Podo (or a selected person).
3. Detail view — when a record or person is selected, show all linked records (same person across forms).

Everything is driven by search + filters.




Mantine `AppShell` for the frame (header + navbar).

Data model (already done in `useJotformSubmissions`)

Each submission is normalized to:

```js
{
  id, formId, formName, createdAt, eventTime,
  location, coordinates: { lat, lng } | null,
  person, relatedPerson, message, priority,
  answers // raw for the detail view
}
```

We'll add one pure derived helper: deriveInvestigation(submissions) that returns:

```js
{
  submissions,           // all normalized submissions
  people: [              // unique people across all records
    { name, encounters, podoEncounters, forms: Set, lastSeenAt, locations: Set }
  ],
  suspects               // people sorted by podoEncounters desc (excluding Podo)
}



## Explicitly out of scope (for now)
- Map / Leaflet
- Proper timeline visualization (we'll use a vertical card list sorted by time)
- Fuzzy name matching — exact match on trimmed lowercase name is enough for this dataset
- Authentication / hiding API keys (challenge provides them)
- Tests
- Dark mode toggle
- i18n

If time remains after phase 7, **in this priority order**: map view → timeline rail → fuzzy matching.



