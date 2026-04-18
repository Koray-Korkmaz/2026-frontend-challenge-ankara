import {
  Alert,
  Badge,
  Button,
  Center,
  CloseButton,
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
  openedId,
  isLoading,
  isError,
  error,
  onCardSelect,
  onClearFocus,
  onClearFilters,
  hasActiveFilters,
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
  const isPodoFocus = !selectedPerson;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="xs" align="center">
          <Title order={6} tt="uppercase" c="dimmed">
            Events
          </Title>
          <Badge
            variant="light"
            color={isPodoFocus ? "yellow" : "blue"}
            rightSection={
              !isPodoFocus && onClearFocus ? (
                <CloseButton
                  size="xs"
                  onClick={onClearFocus}
                  aria-label="Reset to Podo"
                  iconSize={12}
                  variant="transparent"
                />
              ) : null
            }
          >
            {focusName}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {submissions.length} record{submissions.length === 1 ? "" : "s"}
        </Text>
      </Group>

      {submissions.length === 0 ? (
        <Paper withBorder p="lg" radius="md">
          <Stack gap="xs">
            <Text c="dimmed">
              No records involving {focusName}
              {hasActiveFilters ? " match these filters" : ""}.
            </Text>
            {hasActiveFilters && onClearFilters && (
              <Group>
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  onClick={onClearFilters}
                >
                  Clear filters
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {submissions.map((s) => (
            <EventCard
              key={`${s.formId}-${s.id}`}
              submission={s}
              onSelect={onCardSelect}
              active={openedId === s.id}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
