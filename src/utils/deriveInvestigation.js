const PODO = "podo";

export function normalizeName(name) {
  if (!name) return "";
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+\p{L}\.?$/u, "")
    .trim();
}

function diacriticRichness(name) {
  let count = 0;
  for (const c of String(name)) {
    if (c.charCodeAt(0) > 127) count += 1;
  }
  return count;
}

function splitNames(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;]/)
    .map((n) => n.trim())
    .filter(Boolean);
}

export function getMentionedPeople(submission) {
  const names = new Set();

  if (submission.person) names.add(submission.person.trim());
  for (const n of splitNames(submission.relatedPerson)) names.add(n);

  if (submission.message && /\bpodo\b/i.test(submission.message)) {
    names.add("Podo");
  }

  return [...names].filter(Boolean);
}

export function deriveInvestigation(submissions = []) {
  const peopleByKey = new Map();

  for (const sub of submissions) {
    const mentioned = getMentionedPeople(sub);
    const keys = new Set(mentioned.map(normalizeName));
    const hasPodo = keys.has(PODO);

    for (const name of mentioned) {
      const key = normalizeName(name);
      if (!key) continue;
      if (!peopleByKey.has(key)) {
        peopleByKey.set(key, {
          name,
          encounters: 0,
          podoEncounters: 0,
          forms: new Set(),
          locations: new Set(),
          lastSeenAt: null,
          submissionIds: [],
          variants: new Map(),
        });
      }

      const person = peopleByKey.get(key);
      person.variants.set(name, (person.variants.get(name) || 0) + 1);
      person.encounters += 1;
      if (hasPodo && key !== PODO) person.podoEncounters += 1;
      if (sub.formName) person.forms.add(sub.formName);
      if (sub.location) person.locations.add(sub.location);
      person.submissionIds.push(sub.id);

      const when = sub.createdAt || sub.eventTime;
      if (when && (!person.lastSeenAt || String(when) > String(person.lastSeenAt))) {
        person.lastSeenAt = when;
      }
    }
  }

  const people = [...peopleByKey.values()].map((p) => {
    let bestName = p.name;
    let bestCount = -1;
    for (const [variant, count] of p.variants) {
      const better =
        count > bestCount ||
        (count === bestCount &&
          diacriticRichness(variant) > diacriticRichness(bestName));
      if (better) {
        bestName = variant;
        bestCount = count;
      }
    }
    return {
      ...p,
      name: bestName,
      variants: [...p.variants.keys()],
      forms: [...p.forms],
      locations: [...p.locations],
    };
  });

  const suspects = people
    .filter((p) => normalizeName(p.name) !== PODO)
    .sort(
      (a, b) =>
        b.podoEncounters - a.podoEncounters || b.encounters - a.encounters,
    );

  return { submissions, people, suspects };
}

function podoInStructuredFields(s) {
  if (normalizeName(s.person) === PODO) return true;
  return splitNames(s.relatedPerson).some((n) => normalizeName(n) === PODO);
}

function structuredCompanions(s) {
  const out = [];
  if (s.person && normalizeName(s.person) !== PODO) out.push(s.person);
  for (const n of splitNames(s.relatedPerson)) {
    if (normalizeName(n) !== PODO) out.push(n);
  }
  return [...new Set(out)];
}

export function buildCaseSummary(submissions, suspects) {
  if (!submissions || submissions.length === 0) return null;

  const podoSubs = submissions.filter(podoInStructuredFields);

  const lastSighting = sortByTimeDesc(podoSubs)[0] || null;

  const lastCompanions = lastSighting
    ? structuredCompanions(lastSighting)
    : [];

  const locationCounts = new Map();
  for (const s of podoSubs) {
    if (!s.location) continue;
    locationCounts.set(s.location, (locationCounts.get(s.location) || 0) + 1);
  }
  let hotspot = null;
  let hotspotCount = 0;
  for (const [loc, count] of locationCounts) {
    if (count > hotspotCount) {
      hotspot = loc;
      hotspotCount = count;
    }
  }

  return {
    totalRecords: submissions.length,
    totalSuspects: suspects.length,
    topSuspect: suspects[0] || null,
    lastSighting,
    lastCompanions,
    hotspot: hotspot ? { name: hotspot, count: hotspotCount } : null,
  };
}

export function submissionMentionsPerson(submission, personName) {
  if (!personName) return false;
  const target = normalizeName(personName);
  return getMentionedPeople(submission).some(
    (n) => normalizeName(n) === target,
  );
}

function parseEventTime(str) {
  if (!str) return 0;
  const match = String(str).match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/,
  );
  if (match) {
    const [, dd, mm, yyyy, hh, min] = match;
    const t = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`).getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  const iso = Date.parse(str);
  return Number.isNaN(iso) ? 0 : iso;
}

function submissionTimeMs(s) {
  return parseEventTime(s.eventTime) || parseEventTime(s.createdAt) || 0;
}

export function sortByTimeDesc(submissions) {
  return [...submissions].sort(
    (a, b) => submissionTimeMs(b) - submissionTimeMs(a),
  );
}

export function getLinkedSubmissions(submission, allSubmissions) {
  if (!submission) return [];
  const targetNames = new Set(
    getMentionedPeople(submission).map(normalizeName),
  );
  if (targetNames.size === 0) return [];
  return allSubmissions
    .filter((s) => s.id !== submission.id)
    .filter((s) =>
      getMentionedPeople(s).some((n) => targetNames.has(normalizeName(n))),
    );
}

export function submissionMatchesSearch(submission, rawQuery) {
  const query = (rawQuery || "").trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    submission.person,
    submission.relatedPerson,
    submission.location,
    submission.message,
    submission.formName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}
