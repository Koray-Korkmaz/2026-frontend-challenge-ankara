import {
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import EventCard from "./EventCard";

export default function EventFeed({
  submissions,
  selectedPerson,
  isLoading,
  isError,
  error,
  onCardSelect,
}) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Failed to load events">
        {error?.message || "Unknown error"}
      </Alert>
    );
  }

  const focusName = selectedPerson?.name || "Podo";

  return (
    <Stack gap="md">
      <Group justify="space-between" align="baseline">
        <Group gap="xs" align="baseline">
          <Title order={6} tt="uppercase" c="dimmed">
            Events
          </Title>
          <Badge variant="light">{focusName}</Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {submissions.length} record{submissions.length === 1 ? "" : "s"}
        </Text>
      </Group>

      {submissions.length === 0 ? (
        <Paper withBorder p="lg" radius="md">
          <Text c="dimmed">No events found for {focusName}.</Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {submissions.map((s) => (
            <EventCard
              key={`${s.formId}-${s.id}`}
              submission={s}
              onSelect={onCardSelect}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
