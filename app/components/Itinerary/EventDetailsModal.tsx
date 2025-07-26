import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Josefin_Sans } from "next/font/google";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2x4b2Z2b2MwMDFwMnBvN2Z6b2Z2b2MwIn0.1234567890abcdef";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface Label {
  id: string;
  name: string;
  color: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    name: string;
    notes?: string | null;
    location?: any;
    labelId?: string;
    timeStart?: string | null;
  };
  labels: Label[];
  eventsForDay: Array<{
    id: string;
    name: string;
    location?: any;
    timeStart?: string | null;
  }>;
  onSave: (
    notes: string,
    location: any,
    name: string,
    labelId: string | undefined
  ) => void;
}

const DEFAULT_CENTER = { longitude: 103.8198, latitude: 1.3521 }; // Singapore

const getTextColor = (bgColor: string | undefined): string => {
  const safeColor = bgColor || "#f97316";
  const hex = safeColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness > 155 ? "text-orange-950" : "text-white";
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  labels,
  onSave,
  eventsForDay,
}) => {
  const [name, setName] = useState(event.name || "");
  const [notes, setNotes] = useState(event.notes || "");
  const [location, setLocation] = useState(event.location || null);
  const [viewport, setViewport] = useState({
    longitude: location?.longitude || DEFAULT_CENTER.longitude,
    latitude: location?.latitude || DEFAULT_CENTER.latitude,
    zoom: 11,
  });
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [labelId, setLabelId] = useState(
    event.labelId || (labels[0]?.id ?? "")
  );
  const [placePinMode, setPlacePinMode] = useState(false);

  useEffect(() => {
    setName(event.name || "");
    setNotes(event.notes || "");
    setLocation(event.location || null);
    setLabelId(event.labelId || (labels[0]?.id ?? ""));
  }, [event, labels]);

  if (!isOpen) return null;

  const handleMapClick = (e: any) => {
    let lng, lat;
    if (Array.isArray(e.lngLat)) {
      [lng, lat] = e.lngLat;
    } else if (e.lngLat && typeof e.lngLat === "object") {
      lng = e.lngLat.lng;
      lat = e.lngLat.lat;
    }
    if (lng !== undefined && lat !== undefined) {
      setLocation({ longitude: lng, latitude: lat });
      console.log("Pin set at:", { longitude: lng, latitude: lat });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `/api/google-places?input=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setSearchResults(data.predictions || []);
    } catch (err) {
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const handleSelectResult = async (result: any) => {
    setSearch(result.description);
    setSearchResults([]);
    setSearchLoading(true);
    try {
      const detailsRes = await fetch(
        `/api/google-places?place_id=${result.place_id}`
      );
      const detailsData = await detailsRes.json();
      const loc = detailsData.result.geometry.location;
      setLocation({ longitude: loc.lng, latitude: loc.lat });
      setViewport((v) => ({
        ...v,
        longitude: loc.lng,
        latitude: loc.lat,
        zoom: 14,
      }));
    } catch (err) {}
    setSearchLoading(false);
  };

  return (
    <>
      <Head>
        <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBaCRiL9b87UdAibEPvoiKleno7wFDanlY&libraries=places&callback=googleMapsCallback"
          async
          defer
        />
        <script>
          {`
            window.googleMapsCallback = function() {
              window.dispatchEvent(new Event('google-maps-callback'));
            }
          `}
        </script>
      </Head>
      <div
        className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300"
        style={{
          fontFamily: josefin.style.fontFamily,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-orange-200 bg-amber-50">
          <h2 className="text-2xl font-bold text-orange-950">Event Details</h2>
          <button
            className="text-orange-950 text-2xl font-bold hover:text-orange-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="block text-orange-950 font-semibold mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-amber-100 text-orange-950 font-bold border border-orange-200"
            />
          </div>
          <div>
            <label className="block text-orange-950 font-semibold mb-1">
              Label
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => setLabelId(label.id)}
                  className={`px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap transition-colors duration-150 ${
                    labelId === label.id
                      ? "border-2 border-orange-950 scale-105"
                      : "border-orange-950 opacity-80 hover:opacity-100"
                  } ${getTextColor(label.color)}`}
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-orange-950 font-semibold mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] p-2 rounded bg-amber-100 text-orange-950 border border-orange-200"
              placeholder="Add notes about this event..."
            />
          </div>
          <div>
            <label className="block text-orange-950 font-semibold mb-1">
              Location
            </label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                className={`px-3 py-1 rounded-full font-bold border-2 transition-colors duration-150 ${
                  placePinMode
                    ? "bg-orange-950 text-white border-orange-950"
                    : "bg-white text-orange-950 border-orange-300 hover:bg-orange-100"
                }`}
                onClick={() => setPlacePinMode((m) => !m)}
              >
                {placePinMode
                  ? "Click map to place pin (drag disabled)"
                  : "Place Pin"}
              </button>
              {placePinMode && (
                <span className="text-xs text-orange-700">
                  Click on the map to set the event location.
                </span>
              )}
            </div>
            <form onSubmit={handleSearch} className="mb-2 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a place..."
                className="flex-1 p-2 rounded bg-amber-100 text-orange-950 border border-orange-200"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded bg-orange-950 text-white font-bold hover:bg-orange-800"
                disabled={searchLoading}
              >
                {searchLoading ? "..." : "Search"}
              </button>
            </form>
            {searchResults.length > 0 && (
              <div className="bg-white border border-orange-200 rounded shadow-md max-h-32 overflow-y-auto mb-2">
                {searchResults.map((result) => (
                  <div
                    key={result.place_id}
                    className="p-2 hover:bg-amber-100 cursor-pointer text-orange-950"
                    onClick={() => handleSelectResult(result)}
                  >
                    {result.description}
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && search && !searchLoading && (
              <div className="text-xs text-orange-700 mb-2">
                No results found.
              </div>
            )}
            <div className="w-full h-48 rounded overflow-hidden">
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={viewport}
                longitude={viewport.longitude}
                latitude={viewport.latitude}
                zoom={viewport.zoom}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                onMove={(evt) => setViewport(evt.viewState)}
                onClick={placePinMode ? handleMapClick : undefined}
                dragPan={!placePinMode}
              >
                {/* Render all event markers for the day, labeled in order of time */}
                {eventsForDay
                  .filter(
                    (ev) =>
                      ev.location &&
                      ev.location.longitude != null &&
                      ev.location.latitude != null
                  )
                  .sort((a, b) => {
                    if (!a.timeStart || !b.timeStart) return 0;
                    return a.timeStart.localeCompare(b.timeStart);
                  })
                  .map((ev, idx) => (
                    <Marker
                      key={ev.id}
                      longitude={ev.location.longitude}
                      latitude={ev.location.latitude}
                      color={ev.id === event.id ? "#f97316" : "#6366f1"}
                    >
                      <div
                        style={{
                          background:
                            ev.id === event.id ? "#f97316" : "#6366f1",
                          color: "white",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: 16,
                          border:
                            ev.id === event.id ? "2px solid #fff" : "none",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {idx + 1}
                      </div>
                    </Marker>
                  ))}
                {/* Always render a marker for the current event's local location if set and not already in eventsForDay */}
                {location &&
                  !eventsForDay.some(
                    (ev) =>
                      ev.id === event.id &&
                      ev.location &&
                      ev.location.longitude === location.longitude &&
                      ev.location.latitude === location.latitude
                  ) && (
                    <Marker
                      longitude={location.longitude}
                      latitude={location.latitude}
                      color="#f97316"
                    >
                      <div
                        style={{
                          background: "#f97316",
                          color: "white",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: 16,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          opacity: 0.8,
                        }}
                      >
                        📍
                      </div>
                    </Marker>
                  )}
              </Map>
            </div>
            {/* Below the map, add Remove Pin button if a pin is set */}
            {location && (
              <button
                type="button"
                className="mt-2 px-3 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-700"
                onClick={() => setLocation(null)}
              >
                Remove Pin
              </button>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-orange-200 flex justify-end gap-4 bg-amber-50">
          <button
            className="px-4 py-2 rounded bg-orange-950 text-white font-bold hover:bg-orange-800"
            onClick={() => onSave(notes, location, name, labelId)}
          >
            Save
          </button>
          <button
            className="px-4 py-2 rounded bg-white text-orange-950 font-bold border border-orange-300 hover:bg-orange-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default EventDetailsModal;
