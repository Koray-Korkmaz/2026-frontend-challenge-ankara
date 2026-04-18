import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
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

function coordKey(lat, lng) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function numberedIcon({ step, count = 1, isLast, active }) {
  const bg = active ? "#339af0" : isLast ? "#fa5252" : "#fab005";
  const border = active ? "#1c7ed6" : isLast ? "#c92a2a" : "#e67700";
  const size = active ? 32 : 28;
  const badge =
    count > 1
      ? `<div style="
          position:absolute;top:-4px;right:-8px;
          background:#fff;color:#222;border:1.5px solid ${border};
          border-radius:10px;padding:0 5px;
          font-size:10px;font-weight:700;line-height:14px;
          font-family:system-ui,sans-serif;
          box-shadow:0 1px 2px rgba(0,0,0,0.25);
        ">×${count}</div>`
      : "";
  const html = `<div style="position:relative;width:${size}px;height:${size}px;">
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};color:#fff;border:2px solid ${border};
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:12px;font-family:system-ui,sans-serif;
      box-shadow:0 1px 3px rgba(0,0,0,0.45);
    ">${step}</div>
    ${badge}
  </div>`;
  return L.divIcon({
    html,
    className: "podo-step-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
  });
}

function groupRouteStops(stops) {
  const groups = new Map();
  for (const stop of stops) {
    const { lat, lng } = stop.submission.coordinates;
    const key = coordKey(lat, lng);
    if (!groups.has(key)) groups.set(key, { key, lat, lng, stops: [] });
    groups.get(key).stops.push(stop);
  }
  return [...groups.values()].map((g) => {
    const sorted = [...g.stops].sort((a, b) => a.step - b.step);
    return {
      ...g,
      stops: sorted,
      maxStep: sorted[sorted.length - 1].step,
      isLast: sorted.some((s) => s.isLast),
      location: sorted[0].location,
    };
  });
}

function groupPlainSubmissions(submissions) {
  const groups = new Map();
  for (const s of submissions) {
    const { lat, lng } = s.coordinates;
    const key = coordKey(lat, lng);
    if (!groups.has(key)) groups.set(key, { key, lat, lng, submissions: [] });
    groups.get(key).submissions.push(s);
  }
  return [...groups.values()].map((g) => {
    const sorted = [...g.submissions].sort((a, b) => toTime(a) - toTime(b));
    return { ...g, submissions: sorted, location: sorted[0].location };
  });
}

function RouteStopPicker({ group, onSelect }) {
  const map = useMap();
  return (
    <div style={{ fontSize: 12, minWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>
        {group.location || "Unknown location"}
      </div>
      <div style={{ color: "#666", marginBottom: 8 }}>
        {group.stops.length} stops here · pick one to investigate
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {group.stops.map((stop) => (
          <button
            key={stop.submission.id}
            type="button"
            onClick={() => {
              onSelect && onSelect(stop.submission);
              map.closePopup();
            }}
            style={{
              textAlign: "left",
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #e9ecef",
              background: stop.isLast ? "#fff5f5" : "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              Stop {stop.step}
              {stop.isLast ? " · last known" : ""} ·{" "}
              <span style={{ color: "#666", fontWeight: 400 }}>
                {stop.time}
              </span>
            </div>
            <div style={{ color: "#666" }}>
              {stop.companions.length > 0
                ? `w/ ${stop.companions.join(", ")}`
                : "alone"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PlainSubmissionPicker({ group, onSelect }) {
  const map = useMap();
  return (
    <div style={{ fontSize: 12, minWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>
        {group.location || "Unknown location"}
      </div>
      <div style={{ color: "#666", marginBottom: 8 }}>
        {group.submissions.length} reports here · pick one to investigate
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {group.submissions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              onSelect && onSelect(s);
              map.closePopup();
            }}
            style={{
              textAlign: "left",
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #e9ecef",
              background: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {s.person || "Unknown"}
              {s.relatedPerson ? ` · ${s.relatedPerson}` : ""}
            </div>
            <div style={{ color: "#666" }}>
              {s.formName} · {s.eventTime || s.createdAt}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RouteTooltip({ group }) {
  const steps = group.stops.map((s) => s.step).join(", ");
  return (
    <MapTooltip direction="top" offset={[0, -6]} opacity={0.95}>
      <div style={{ fontSize: 12, lineHeight: 1.4 }}>
        <strong>{group.location || "Unknown location"}</strong>
        {group.isLast ? " · last known" : ""}
        <br />
        <span style={{ color: "#666" }}>
          {group.stops.length > 1
            ? `Stops ${steps} · click to pick`
            : `Stop ${steps} · click to open`}
        </span>
      </div>
    </MapTooltip>
  );
}

function PlainTooltip({ group }) {
  const count = group.submissions.length;
  const first = group.submissions[0];
  return (
    <MapTooltip direction="top" offset={[0, -30]} opacity={0.95}>
      <div style={{ fontSize: 12, lineHeight: 1.4 }}>
        <strong>{group.location || first.location || "Unknown"}</strong>
        <br />
        {count > 1 ? (
          <span style={{ color: "#666" }}>
            {count} reports here · click to pick
          </span>
        ) : (
          <>
            <span>
              {first.person || "Unknown"}
              {first.relatedPerson ? ` · ${first.relatedPerson}` : ""}
            </span>
            <br />
            <span style={{ color: "#666" }}>
              {first.formName} · {first.eventTime || first.createdAt}
            </span>
          </>
        )}
      </div>
    </MapTooltip>
  );
}

export default function MiniMap({
  submissions,
  route,
  focusName,
  openedId,
  onSelect,
}) {
  const routeStops = useMemo(() => {
    if (!route || route.length === 0) return [];
    return route.filter((stop) => stop.submission.coordinates);
  }, [route]);

  const useRouteMode = routeStops.length > 0;

  const routeGroups = useMemo(
    () => (useRouteMode ? groupRouteStops(routeStops) : []),
    [useRouteMode, routeStops],
  );

  const withCoords = useMemo(
    () => submissions.filter((s) => s.coordinates),
    [submissions],
  );

  const plainGroups = useMemo(
    () => (useRouteMode ? [] : groupPlainSubmissions(withCoords)),
    [useRouteMode, withCoords],
  );

  const positions = useMemo(() => {
    if (useRouteMode) return routeGroups.map((g) => [g.lat, g.lng]);
    return plainGroups.map((g) => [g.lat, g.lng]);
  }, [useRouteMode, routeGroups, plainGroups]);

  const sortedPath = useMemo(() => {
    if (useRouteMode) {
      return routeStops.map((stop) => [
        stop.submission.coordinates.lat,
        stop.submission.coordinates.lng,
      ]);
    }
    const sorted = [...withCoords].sort((a, b) => toTime(a) - toTime(b));
    return sorted.map((s) => [s.coordinates.lat, s.coordinates.lng]);
  }, [useRouteMode, routeStops, withCoords]);

  const plottedCount = useRouteMode ? routeStops.length : withCoords.length;

  if (plottedCount === 0) return null;

  return (
    <Paper withBorder radius="md" p="xs">
      <Group justify="space-between" px="xs" pb="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {useRouteMode ? `Map · ${focusName}'s route` : `Map · ${focusName}`}
        </Text>
        <Badge variant="light" size="sm">
          {plottedCount} {useRouteMode ? "stops" : "plotted"}
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

          {useRouteMode &&
            routeGroups.map((group) => {
              const active = group.stops.some(
                (s) => s.submission.id === openedId,
              );
              const single = group.stops.length === 1;
              return (
                <Marker
                  key={`route-${group.key}`}
                  position={[group.lat, group.lng]}
                  icon={numberedIcon({
                    step: group.maxStep,
                    count: group.stops.length,
                    isLast: group.isLast,
                    active,
                  })}
                  zIndexOffset={active ? 1000 : group.isLast ? 500 : 0}
                  eventHandlers={
                    single
                      ? {
                          click: () =>
                            onSelect && onSelect(group.stops[0].submission),
                        }
                      : undefined
                  }
                >
                  <RouteTooltip group={group} />
                  {!single && (
                    <Popup maxWidth={280} closeButton>
                      <RouteStopPicker group={group} onSelect={onSelect} />
                    </Popup>
                  )}
                </Marker>
              );
            })}

          {!useRouteMode &&
            plainGroups.map((group) => {
              const single = group.submissions.length === 1;
              return (
                <Marker
                  key={`plain-${group.key}`}
                  position={[group.lat, group.lng]}
                  eventHandlers={
                    single
                      ? {
                          click: () =>
                            onSelect && onSelect(group.submissions[0]),
                        }
                      : undefined
                  }
                >
                  <PlainTooltip group={group} />
                  {!single && (
                    <Popup maxWidth={280} closeButton>
                      <PlainSubmissionPicker
                        group={group}
                        onSelect={onSelect}
                      />
                    </Popup>
                  )}
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </Paper>
  );
}
