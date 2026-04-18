import { useMemo } from "react";
import {
  Badge,
  Divider,
  Drawer,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  getLinkedSubmissions,
  sortByTimeDesc,
} from "../utils/deriveInvestigation";

const FORM_COLORS = {
  Checkins: "blue",
  Messages: "grape",
  Sightings: "teal",
  "Personal Notes": "indigo",
  "Anonymous Tips": "red",
};

const FIELD_ORDER = [
  "personName",
  "senderName",
  "authorName",
  "suspectName",
  "recipientName",
  "seenWith",
  "mentionedPeople",
  "timestamp",
  "submissionDate",
  "location",
  "coordinates",
  "note",
  "text",
  "tip",
  "urgency",
  "confidence",
];

function orderedAnswerEntries(answers) {
  const entries = Object.entries(answers || {});
  return entries.sort(([a], [b]) => {
    const ai = FIELD_ORDER.indexOf(a);
    const bi = FIELD_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function LinkedRow({ submission, onSelect }) {
  return (
    <UnstyledButton
      p="sm"
      onClick={() => onSelect(submission)}
      style={{
        borderRadius: 8,
        border: "1px solid var(--mantine-color-gray-3)",
        width: "100%",
      }}
    >
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap">
          <Badge
            size="xs"
            color={FORM_COLORS[submission.formName] || "gray"}
            variant="light"
          >
            {submission.formName}
          </Badge>
          <Text size="xs" c="dimmed">
            {submission.eventTime || submission.createdAt || ""}
          </Text>
        </Group>
        <Text size="sm" fw={500} truncate>
          {submission.person || "Unknown"}
          {submission.relatedPerson ? ` · ${submission.relatedPerson}` : ""}
        </Text>
        {submission.message && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {submission.message}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
}

export default function DetailDrawer({
  submission,
  allSubmissions,
  opened,
  onClose,
  onSelectLinked,
}) {
  const linked = useMemo(() => {
    if (!submission) return [];
    return sortByTimeDesc(getLinkedSubmissions(submission, allSubmissions));
  }, [submission, allSubmissions]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={560}
      padding="md"
      title={
        submission ? (
          <Group gap="sm">
            <Badge
              color={FORM_COLORS[submission.formName] || "gray"}
              variant="light"
            >
              {submission.formName}
            </Badge>
            <Text size="sm" c="dimmed">
              {submission.eventTime || submission.createdAt}
            </Text>
          </Group>
        ) : (
          "Details"
        )
      }
    >
      {!submission ? (
        <Text c="dimmed">No record selected.</Text>
      ) : (
        <ScrollArea h="calc(100vh - 110px)">
          <Stack gap="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Summary
              </Text>
              <Text fw={600}>
                {submission.person || "Unknown"}
                {submission.relatedPerson && (
                  <Text span c="dimmed" fw={400}>
                    {" "}
                    with {submission.relatedPerson}
                  </Text>
                )}
              </Text>
              {submission.location && (
                <Text size="sm">{submission.location}</Text>
              )}
              {submission.message && (
                <Text size="sm" mt={4}>
                  {submission.message}
                </Text>
              )}
            </Stack>

            <Divider />

            <Stack gap={8}>
              <Text size="xs" c="dimmed" tt="uppercase">
                All fields
              </Text>
              {orderedAnswerEntries(submission.answers).map(([key, value]) => (
                <Group key={key} gap="md" align="flex-start" wrap="nowrap">
                  <Text
                    size="xs"
                    c="dimmed"
                    tt="capitalize"
                    style={{ minWidth: 140 }}
                  >
                    {key}
                  </Text>
                  <Text size="sm" style={{ flex: 1, wordBreak: "break-word" }}>
                    {String(value)}
                  </Text>
                </Group>
              ))}
              <Group gap="md" wrap="nowrap">
                <Text size="xs" c="dimmed" style={{ minWidth: 140 }}>
                  created_at
                </Text>
                <Text size="sm">{submission.createdAt || "-"}</Text>
              </Group>
              <Group gap="md" wrap="nowrap">
                <Text size="xs" c="dimmed" style={{ minWidth: 140 }}>
                  submission_id
                </Text>
                <Text size="sm" ff="monospace">
                  {submission.id}
                </Text>
              </Group>
            </Stack>

            <Divider />

            <Stack gap={8}>
              <Group justify="space-between" align="baseline">
                <Title order={6} tt="uppercase" c="dimmed">
                  Linked records
                </Title>
                <Text size="xs" c="dimmed">
                  {linked.length}
                </Text>
              </Group>
              {linked.length === 0 ? (
                <Paper withBorder p="sm" radius="md">
                  <Text size="sm" c="dimmed">
                    No other records share the same people.
                  </Text>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {linked.map((s) => (
                    <LinkedRow
                      key={`${s.formId}-${s.id}`}
                      submission={s}
                      onSelect={onSelectLinked}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </ScrollArea>
      )}
    </Drawer>
  );
}
