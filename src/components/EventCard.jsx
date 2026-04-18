import { Badge, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";

const FORM_COLORS = {
  Checkins: "blue",
  Messages: "grape",
  Sightings: "teal",
  "Personal Notes": "indigo",
  "Anonymous Tips": "red",
};

const PRIORITY_COLORS = {
  low: "gray",
  medium: "yellow",
  high: "red",
};

function formatWhen(submission) {
  if (submission.eventTime) return submission.eventTime;
  if (!submission.createdAt) return "-";
  const d = new Date(submission.createdAt);
  if (Number.isNaN(d.getTime())) return submission.createdAt;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function EventCard({ submission, onSelect }) {
  const {
    formName,
    person,
    relatedPerson,
    location,
    coordinates,
    message,
    priority,
  } = submission;

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      onClick={onSelect ? () => onSelect(submission) : undefined}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Badge color={FORM_COLORS[formName] || "gray"} variant="light">
            {formName}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatWhen(submission)}
          </Text>
        </Group>

        <Group gap="xs">
          <Text fw={600}>{person || "Unknown"}</Text>
          {relatedPerson && (
            <>
              <Text c="dimmed" size="sm">
                with
              </Text>
              <Text fw={500}>{relatedPerson}</Text>
            </>
          )}
        </Group>

        {(location || coordinates) && (
          <Group gap={6}>
            {location && <Text size="sm">{location}</Text>}
            {coordinates && (
              <Tooltip
                label={`${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`}
              >
                <Text size="xs" c="dimmed">
                  ({coordinates.lat.toFixed(3)}, {coordinates.lng.toFixed(3)})
                </Text>
              </Tooltip>
            )}
          </Group>
        )}

        {message && (
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {message}
          </Text>
        )}

        {priority && (
          <Badge
            color={PRIORITY_COLORS[priority] || "gray"}
            variant="outline"
            size="sm"
          >
            {priority}
          </Badge>
        )}
      </Stack>
    </Paper>
  );
}
