import {
  Badge,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

function formatTime(value) {
  if (!value) return "";
  const match = String(value).match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/,
  );
  if (match) return `${match[4]}:${match[5]}`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function RouteStop({ stop, active, onSelect }) {
  const { isLast } = stop;
  const accentColor = isLast ? "red" : "yellow";

  return (
    <UnstyledButton onClick={() => onSelect(stop.submission)}>
      <Paper
        withBorder
        radius="md"
        p="xs"
        style={{
          minWidth: 168,
          maxWidth: 168,
          borderColor: active
            ? "var(--mantine-color-blue-5)"
            : isLast
              ? "var(--mantine-color-red-5)"
              : undefined,
          backgroundColor: isLast
            ? "var(--mantine-color-red-0)"
            : active
              ? "var(--mantine-color-blue-0)"
              : undefined,
        }}
      >
        <Stack gap={4}>
          <Group gap={6} justify="space-between" wrap="nowrap">
            <Badge
              size="xs"
              radius="sm"
              variant="filled"
              color={accentColor}
            >
              {stop.step}
            </Badge>
            <Text size="xs" c="dimmed">
              {formatTime(stop.time)}
            </Text>
          </Group>
          <Text fw={600} size="sm" lineClamp={1}>
            {stop.location}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {stop.companions.length > 0
              ? `w/ ${stop.companions.join(", ")}`
              : "alone"}
          </Text>
          {isLast && (
            <Text size="xs" c="red" fw={600}>
              last known
            </Text>
          )}
        </Stack>
      </Paper>
    </UnstyledButton>
  );
}

export default function PodoRouteStrip({ route, openedId, onSelect }) {
  if (!route || route.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="sm">
      <Group justify="space-between" pb="xs">
        <Group gap={8}>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Podo's route
          </Text>
          <Badge size="xs" radius="sm" variant="light" color="gray">
            {route.length} stops
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          first → last known
        </Text>
      </Group>

      <ScrollArea type="auto" offsetScrollbars scrollbarSize={6}>
        <Group gap="xs" wrap="nowrap" align="stretch" pb={4}>
          {route.map((stop, index) => (
            <Group key={stop.submission.id} gap={4} wrap="nowrap">
              <RouteStop
                stop={stop}
                active={openedId === stop.submission.id}
                onSelect={onSelect}
              />
              {index < route.length - 1 && (
                <Text c="dimmed" size="sm" fw={700}>
                  →
                </Text>
              )}
            </Group>
          ))}
        </Group>
      </ScrollArea>
    </Paper>
  );
}
