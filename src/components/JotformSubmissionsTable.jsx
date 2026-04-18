import {
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useJotformSubmissions } from "../hooks/useJotformSubmissions";

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

function formatCreatedAt(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function truncate(value, max = 80) {
  if (!value) return "-";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function JotformSubmissionsTable() {
  const { data: submissions = [], isLoading, isError, error } =
    useJotformSubmissions();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Could not load submissions">
        {error?.message || "Something went wrong while fetching submissions."}
      </Alert>
    );
  }

  if (submissions.length === 0) {
    return (
      <Paper withBorder p="lg" radius="md">
        <Text c="dimmed">No submissions found.</Text>
      </Paper>
    );
  }

  const rows = submissions.map((s) => (
    <Table.Tr key={`${s.formId}-${s.id}`}>
      <Table.Td>
        <Badge color={FORM_COLORS[s.formName] || "gray"} variant="light">
          {s.formName}
        </Badge>
      </Table.Td>
      <Table.Td>{s.person || "-"}</Table.Td>
      <Table.Td>{s.relatedPerson || "-"}</Table.Td>
      <Table.Td>{s.eventTime || formatCreatedAt(s.createdAt)}</Table.Td>
      <Table.Td>{s.location || "-"}</Table.Td>
      <Table.Td>
        {s.coordinates ? (
          <Text size="xs" c="dimmed">
            {s.coordinates.lat.toFixed(5)}, {s.coordinates.lng.toFixed(5)}
          </Text>
        ) : (
          "-"
        )}
      </Table.Td>
      <Table.Td style={{ maxWidth: 320 }}>
        <Tooltip label={s.message || ""} disabled={!s.message} multiline w={320}>
          <Text size="sm">{truncate(s.message)}</Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        {s.priority ? (
          <Badge color={PRIORITY_COLORS[s.priority] || "gray"} variant="outline">
            {s.priority}
          </Badge>
        ) : (
          "-"
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper withBorder p="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Jotform Submissions</Title>
        <Text size="sm" c="dimmed">
          {submissions.length} total
        </Text>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Form</Table.Th>
              <Table.Th>Who</Table.Th>
              <Table.Th>With / Related</Table.Th>
              <Table.Th>When</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Coordinates</Table.Th>
              <Table.Th>Message</Table.Th>
              <Table.Th>Priority</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

export default JotformSubmissionsTable;
