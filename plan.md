Missing Podo: The Ankara Case — Implementation Plan

Scope of UI
- core investigation experience
- Keep components small, avoid unnecessary abstractions.
- One data hook, one normalizer, clear naming.

API Structure:

Fields per form (what lives under `answers`)

| Form | Primary person | Secondary person | Content | Extra |
|---|---|---|---|---|
| **Checkins** (`261065067494966`) | `personName` | — | `note` | — |
| **Messages** (`261065765723966`) | `senderName` | `recipientName` | `text` | `urgency` |
| **Sightings** (`261065244786967`) | `personName` | `seenWith` | `note` | — |
| **Personal Notes** (`261065509008958`) | `authorName` | `mentionedPeople` | `note` | — |
| **Anonymous Tips** (`261065875889981`) | `suspectName` | — | `tip` | `confidence`, `submissionDate` |

Common across all 5: `timestamp` (event time), `location`, `coordinates` (`"lat,lng"` string).


Product concept

Every record mentions one or more people. Podo is the subject. A "suspect" is anyone who appears alongside Podo across records (seen with, messaged, mentioned, tipped about).

Three pieces make the investigation story land:

1. Suspects panel: ranked list of people by number of co-occurrences with Podo. This is the "who looks most suspicious" answer.
2. Event feed: chronological list of all records involving Podo (or a selected person).
3. Detail view — when a record or person is selected, show all linked records (same person across forms).

Everything is driven by search + filters.

Math behind submission for eample Kağan's 11 enteries we aggragate:

Checkins
Kağan himself checked in
Messages
Kağan is sender or recipient
Sightings
Kağan is the person being observed or the person someone was "seen with"
Personal Notes
Kağan wrote the note or is listed in mentionedPeople
Anonymous Tips
Kağan is named as the suspect


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



Explicitly out of scope (for now)
- Map / Leaflet
- Proper timeline visualization (we'll use a vertical card list sorted by time)
- Fuzzy name matching — exact match on trimmed lowercase name is enough for this dataset
- Authentication / hiding API keys (challenge provides them)
- Tests
- Dark mode toggle
- i18n

If time remains after phase 7, **in this priority order**: map view → timeline rail → fuzzy matching.



