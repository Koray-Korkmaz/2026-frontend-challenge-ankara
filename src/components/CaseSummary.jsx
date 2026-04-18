import { Group, Paper, Stack, Text, UnstyledButton } from "@mantine/core";

function SummaryTile({ label, title, subtitle, onClick, accent }) {
  const body = (
    <Paper
      withBorder
      radius="md"
      p="md"
      h="100%"
      style={{
        cursor: onClick ? "pointer" : "default",
        borderColor: accent ? `var(--mantine-color-${accent}-4)` : undefined,
        backgroundColor: accent
          ? `var(--mantine-color-${accent}-0)`
          : undefined,
      }}
    >
      <Stack gap={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
        <Text fw={600} size="md" lineClamp={1}>
          {title || "—"}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {subtitle}
          </Text>
        )}
      </Stack>
    </Paper>
  );

  if (onClick) {
    return (
      <UnstyledButton onClick={onClick} style={{ width: "100%" }}>
        {body}
      </UnstyledButton>
    );
  }
  return body;
}

export default function CaseSummary({
  summary,
  onSelectSuspect,
  onOpenSighting,
}) {
  if (!summary) return null;

  const { topSuspect, lastSighting, lastCompanions, hotspot } = summary;

  const lastSightingTitle = lastCompanions.length
    ? lastCompanions.join(", ")
    : lastSighting?.person || "—";

  const lastSightingSubtitle = lastSighting
    ? [
        lastSighting.eventTime || lastSighting.createdAt,
        lastSighting.location,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <Group gap="sm" grow align="stretch" wrap="nowrap">
      <SummaryTile
        label="Top suspect"
        title={topSuspect?.name}
        subtitle={
          topSuspect
            ? `${topSuspect.podoEncounters} with Podo · ${topSuspect.encounters} records`
            : null
        }
        onClick={topSuspect ? () => onSelectSuspect(topSuspect) : undefined}
        accent="red"
      />
      <SummaryTile
        label="Last seen with"
        title={lastSightingTitle}
        subtitle={lastSightingSubtitle}
        onClick={lastSighting ? () => onOpenSighting(lastSighting) : undefined}
        accent="yellow"
      />
      <SummaryTile
        label="Podo hotspot"
        title={hotspot?.name}
        subtitle={
          hotspot
            ? `Podo recorded here in ${hotspot.count} record${hotspot.count === 1 ? "" : "s"}`
            : null
        }
      />
    </Group>
  );
}
