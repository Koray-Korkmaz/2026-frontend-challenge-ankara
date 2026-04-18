import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip as MapTooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Badge, Group, Paper, Text } from "@mantine/core";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ANKARA_CENTER = [39.925, 32.865];

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }, [positions, map]);
  return null;
}

function toTime(s) {
  const d = new Date(s.eventTime || s.createdAt || 0).getTime();
  return Number.isNaN(d) ? 0 : d;
}

export default function MiniMap({ submissions, focusName, onSelect }) {
  const withCoords = useMemo(
    () => submissions.filter((s) => s.coordinates),
    [submissions],
  );

  const positions = useMemo(
    () => withCoords.map((s) => [s.coordinates.lat, s.coordinates.lng]),
    [withCoords],
  );

  const sortedPath = useMemo(() => {
    const sorted = [...withCoords].sort((a, b) => toTime(a) - toTime(b));
    return sorted.map((s) => [s.coordinates.lat, s.coordinates.lng]);
  }, [withCoords]);

  if (withCoords.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="xs">
      <Group justify="space-between" px="xs" pb="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Map · {focusName}
        </Text>
        <Badge variant="light" size="sm">
          {withCoords.length} plotted
        </Badge>
      </Group>
      <div
        style={{
          height: 280,
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          isolation: "isolate",
          zIndex: 0,
        }}
      >
        <MapContainer
          center={ANKARA_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />
          {sortedPath.length > 1 && (
            <Polyline
              positions={sortedPath}
              pathOptions={{
                color: "#fab005",
                weight: 3,
                opacity: 0.7,
                dashArray: "6 6",
              }}
            />
          )}
          {withCoords.map((s) => (
            <Marker
              key={`${s.formId}-${s.id}`}
              position={[s.coordinates.lat, s.coordinates.lng]}
              eventHandlers={{
                click: () => onSelect && onSelect(s),
              }}
            >
              <MapTooltip direction="top" offset={[0, -30]} opacity={0.95}>
                <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                  <strong>{s.person || "Unknown"}</strong>
                  {s.relatedPerson ? ` · ${s.relatedPerson}` : ""}
                  <br />
                  <span style={{ color: "#666" }}>
                    {s.formName} · {s.eventTime || s.createdAt}
                  </span>
                  {s.location && (
                    <>
                      <br />
                      <span>{s.location}</span>
                    </>
                  )}
                </div>
              </MapTooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Paper>
  );
}
