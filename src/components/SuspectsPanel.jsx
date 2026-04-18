import {
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";

function SuspectRow({ suspect, active, onSelect }) {
  return (
    <UnstyledButton
      onClick={() => onSelect(suspect)}
      p="sm"
      style={{
        borderRadius: 8,
        backgroundColor: active ? "var(--mantine-color-yellow-1)" : "transparent",
        border: active
          ? "1px solid var(--mantine-color-yellow-5)"
          : "1px solid transparent",
        width: "100%",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text fw={600} truncate>
            {suspect.name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {suspect.forms.length} source{suspect.forms.length === 1 ? "" : "s"}
            {suspect.locations[0] ? ` • ${suspect.locations[0]}` : ""}
            {` • ${suspect.encounters} record${suspect.encounters === 1 ? "" : "s"}`}
          </Text>
        </Stack>
        <Tooltip
          label={`${suspect.podoEncounters} with Podo · ${suspect.encounters} total`}
          withArrow
        >
          <Badge
            color="red"
            variant={suspect.podoEncounters > 0 ? "filled" : "light"}
          >
            {suspect.podoEncounters}
          </Badge>
        </Tooltip>
      </Group>
    </UnstyledButton>
  );
}

export default function SuspectsPanel({
  suspects,
  selectedPerson,
  onSelect,
  isLoading,
  isError,
  error,
}) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Failed to load">
        {error?.message || "Unknown error"}
      </Alert>
    );
  }

  return (
    <Stack gap="sm" h="100%">
      <Group justify="space-between" align="baseline">
        <Title order={6} tt="uppercase" c="dimmed">
          Suspects
        </Title>
        <Text size="xs" c="dimmed">
          {suspects.length} people
        </Text>
      </Group>

      <Text size="xs" c="dimmed">
        Red badge: co-occurrences with Podo.
      </Text>

      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={4}>
          {suspects.length === 0 ? (
            <Text size="sm" c="dimmed">
              No suspects yet.
            </Text>
          ) : (
            suspects.map((suspect) => (
              <SuspectRow
                key={suspect.name.toLowerCase()}
                suspect={suspect}
                active={
                  selectedPerson?.name.toLowerCase() === suspect.name.toLowerCase()
                }
                onSelect={onSelect}
              />
            ))
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
