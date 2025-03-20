import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Load API Key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_maps;

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // Default center

const HomeMap = ({ locations }) => {
  const [map, setMap] = useState(null);
  const boundsRef = useRef(null);

  useEffect(() => {
    if (map && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      const santaCruz = locations.filter(
        (location) => location.city === "Santa Cruz",
      );
      santaCruz.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds);
      boundsRef.current = bounds;
    }
  }, [map, locations]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={defaultCenter}
        onLoad={setMap}
      >
        {/* Render Multiple Markers */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default HomeMap;
