import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const JOTFORM_API_URL = "https://api.jotform.com";

export const JOTFORM_FORMS = [
  { name: "Checkins", id: "261065067494966" },
  { name: "Messages", id: "261065765723966" },
  { name: "Sightings", id: "261065244786967" },
  { name: "Personal Notes", id: "261065509008958" },
  { name: "Anonymous Tips", id: "261065875889981" },
];

export const JOTFORM_API_KEYS = [
  "ad39735f1449a6dc28d60e0921352665",
  "54a934fa20b1ccc3a5bd1d2076f90556",
  "5593acd695caab1a3805c3af8532df09",
];

function flattenAnswers(answers) {
  if (!answers || typeof answers !== "object") {
    return {};
  }

  const result = {};
  for (const key of Object.keys(answers)) {
    const entry = answers[key];
    if (!entry || typeof entry !== "object") continue;
    if (entry.type === "control_head" || entry.type === "control_button") continue;
    if (entry.name && entry.answer !== undefined && entry.answer !== "") {
      result[entry.name] = entry.answer;
    }
  }
  return result;
}

function parseCoordinates(raw) {
  if (typeof raw !== "string") return null;
  const parts = raw.split(",").map((v) => Number(v.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { lat: parts[0], lng: parts[1] };
}

function normalizeSubmission(raw, form) {
  const answers = flattenAnswers(raw.answers);

  const person =
    answers.personName ||
    answers.senderName ||
    answers.authorName ||
    answers.suspectName ||
    null;

  const relatedPerson =
    answers.recipientName ||
    answers.seenWith ||
    answers.mentionedPeople ||
    null;

  const message = answers.note || answers.text || answers.tip || null;

  const priority = answers.urgency || answers.confidence || null;

  return {
    id: raw.id,
    formId: form.id,
    formName: form.name,
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
    status: raw.status || null,
    eventTime: answers.timestamp || null,
    location: answers.location || null,
    coordinates: parseCoordinates(answers.coordinates),
    person,
    relatedPerson,
    message,
    priority,
    answers,
  };
}

async function fetchFormSubmissionsWithKey(formId, apiKey) {
  const { data } = await axios.get(`${JOTFORM_API_URL}/form/${formId}/submissions`, {
    params: { apiKey },
  });

  if (data?.responseCode && data.responseCode !== 200) {
    throw new Error(data.message || `Jotform error ${data.responseCode}`);
  }

  return Array.isArray(data?.content) ? data.content : [];
}

async function fetchFormSubmissions(form) {
  let lastError;

  for (const apiKey of JOTFORM_API_KEYS) {
    try {
      const submissions = await fetchFormSubmissionsWithKey(form.id, apiKey);
      return submissions.map((submission) => normalizeSubmission(submission, form));
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to fetch submissions for "${form.name}" (${form.id}).`,
    { cause: lastError },
  );
}

export async function fetchJotformSubmissions() {
  const submissionsByForm = await Promise.all(
    JOTFORM_FORMS.map((form) => fetchFormSubmissions(form)),
  );

  return submissionsByForm
    .flat()
    .sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")),
    );
}

export function useJotformSubmissions() {
  return useQuery({
    queryKey: ["jotform-submissions"],
    queryFn: fetchJotformSubmissions,
    staleTime: 1000 * 60 * 5,
  });
}
