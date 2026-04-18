const PODO = "podo";

export function normalizeName(name) {
  if (!name) return "";
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

export function submissionMentionsPerson(submission, personName) {
  if (!personName) return false;
  const target = normalizeName(personName);
  return getMentionedPeople(submission).some(
    (n) => normalizeName(n) === target,
  );
}

export function sortByTimeDesc(submissions) {
  return [...submissions].sort((a, b) => {
    const aWhen = a.createdAt || a.eventTime || "";
    const bWhen = b.createdAt || b.eventTime || "";
    return String(bWhen).localeCompare(String(aWhen));
  });
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
