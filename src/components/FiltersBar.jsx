import { Chip, CloseButton, Group, TextInput } from "@mantine/core";
import { JOTFORM_FORMS } from "../hooks/useJotformSubmissions";

export default function FiltersBar({
  search,
  onSearchChange,
  selectedForms,
  onSelectedFormsChange,
}) {
  return (
    <Group gap="md" align="center" wrap="wrap">
      <TextInput
        placeholder="Search person, location, content..."
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        rightSection={
          search ? (
            <CloseButton
              size="sm"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            />
          ) : null
        }
        style={{ flex: 1, minWidth: 240, maxWidth: 360 }}
      />

      <Chip.Group
        multiple
        value={selectedForms}
        onChange={onSelectedFormsChange}
      >
        <Group gap="xs">
          {JOTFORM_FORMS.map((form) => (
            <Chip key={form.id} value={form.name} size="sm" variant="light">
              {form.name}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Group>
  );
}
