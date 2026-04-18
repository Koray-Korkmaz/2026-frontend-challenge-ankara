import { useMemo, useState } from "react";
import { AppShell, Badge, Group, Stack, Text, Title } from "@mantine/core";
import SuspectsPanel from "./components/SuspectsPanel";
import EventFeed from "./components/EventFeed";
import FiltersBar from "./components/FiltersBar";
import DetailDrawer from "./components/DetailDrawer";
import { useJotformSubmissions } from "./hooks/useJotformSubmissions";
import {
  deriveInvestigation,
  sortByTimeDesc,
  submissionMatchesSearch,
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
  const [search, setSearch] = useState("");
  const [selectedForms, setSelectedForms] = useState([]);
  const [openedId, setOpenedId] = useState(null);

  const focusName = selectedPerson?.name || "Podo";

  const feedSubmissions = useMemo(() => {
    const filtered = submissions
      .filter((s) => submissionMentionsPerson(s, focusName))
      .filter((s) =>
        selectedForms.length === 0 ? true : selectedForms.includes(s.formName),
      )
      .filter((s) => submissionMatchesSearch(s, search));
    return sortByTimeDesc(filtered);
  }, [submissions, focusName, selectedForms, search]);

  const openedSubmission = useMemo(
    () => submissions.find((s) => s.id === openedId) || null,
    [submissions, openedId],
  );

  const handleSelect = (person) => {
    setSelectedPerson((current) =>
      current?.name.toLowerCase() === person.name.toLowerCase() ? null : person,
    );
  };

  const handleOpenCard = (submission) => setOpenedId(submission.id);
  const handleCloseDrawer = () => setOpenedId(null);
  const handleSelectLinked = (submission) => setOpenedId(submission.id);

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
        <Stack gap="md">
          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            selectedForms={selectedForms}
            onSelectedFormsChange={setSelectedForms}
          />
          <EventFeed
            submissions={feedSubmissions}
            selectedPerson={selectedPerson}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onCardSelect={handleOpenCard}
          />
        </Stack>
      </AppShell.Main>

      <DetailDrawer
        submission={openedSubmission}
        allSubmissions={submissions}
        opened={Boolean(openedSubmission)}
        onClose={handleCloseDrawer}
        onSelectLinked={handleSelectLinked}
      />
    </AppShell>
  );
}
