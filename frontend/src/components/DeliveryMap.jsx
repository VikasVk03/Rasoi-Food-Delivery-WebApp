import React, { useEffect, useRef } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DeliveryMap = ({ lat, lng, markers = [], routePath = [] }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([lat, lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], 14);
    }

    const activeMarkers = [];
    const sourceMarkers = markers.length
      ? markers
      : [{ label: "Location", lat, lng }];

    sourceMarkers.forEach((point) => {
      const marker = L.marker([point.lat, point.lng]).addTo(mapRef.current);
      if (point.label) {
        marker.bindPopup(point.label);
      }
      activeMarkers.push(marker);
    });

    let polyline = null;
    if (routePath.length > 1) {
      polyline = L.polyline(
        routePath.map((point) => [point.lat, point.lng]),
        { color: "#2563eb", weight: 4 },
      ).addTo(mapRef.current);
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }

    return () => {
      if (mapRef.current) {
        activeMarkers.forEach((marker) => mapRef.current.removeLayer(marker));
        if (polyline) {
          mapRef.current.removeLayer(polyline);
        }
      }
    };
  }, [lat, lng, markers, routePath]);

  return <div ref={containerRef} className="h-64 w-full rounded-xl border border-gray-200" />;
};

export default DeliveryMap;
