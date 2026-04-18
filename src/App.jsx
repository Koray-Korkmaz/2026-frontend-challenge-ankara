import { AppShell, Badge, Group, Text, Title } from "@mantine/core";

export default function App() {
  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 300, breakpoint: "sm" }}
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
        <Title order={6} c="dimmed" tt="uppercase" mb="sm">
          Suspects
        </Title>
        <Text c="dimmed" size="sm">
          Ranked suspects will appear here.
        </Text>
      </AppShell.Navbar>

      <AppShell.Main>
        <Title order={6} c="dimmed" tt="uppercase" mb="sm">
          Events
        </Title>
        <Text c="dimmed" size="sm">
          The chain of Podo's sightings will appear here.
        </Text>
      </AppShell.Main>
    </AppShell>
  );
}
