import { useMemo, useState } from "react";
import { AppShell, Badge, Group, Text, Title } from "@mantine/core";
import SuspectsPanel from "./components/SuspectsPanel";
import EventFeed from "./components/EventFeed";
import { useJotformSubmissions } from "./hooks/useJotformSubmissions";
import {
  deriveInvestigation,
  sortByTimeDesc,
  submissionMentionsPerson,
} from "./utils/deriveInvestigation";

export default function App() {
  const { data: submissions = [], isLoading, isError, error } =
    useJotformSubmissions();

  const { suspects } = useMemo(
    () => deriveInvestigation(submissions),
    [submissions],
  );

  const [selectedPerson, setSelectedPerson] = useState(null);

  const focusName = selectedPerson?.name || "Podo";

  const feedSubmissions = useMemo(() => {
    const filtered = submissions.filter((s) =>
      submissionMentionsPerson(s, focusName),
    );
    return sortByTimeDesc(filtered);
  }, [submissions, focusName]);

  const handleSelect = (person) => {
    setSelectedPerson((current) =>
      current?.name.toLowerCase() === person.name.toLowerCase() ? null : person,
    );
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 320, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Title order={4}>Missing Podo</Title>
            <Text c="dimmed" size="sm">
              The Ankara Case
            </Text>
          </Group>
          <Badge color="yellow" variant="light">
            Investigation
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <SuspectsPanel
          suspects={suspects}
          selectedPerson={selectedPerson}
          onSelect={handleSelect}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <EventFeed
          submissions={feedSubmissions}
          selectedPerson={selectedPerson}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </AppShell.Main>
    </AppShell>
  );
}
