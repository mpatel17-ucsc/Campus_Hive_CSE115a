import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Load API Key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_maps;

// Define map container styles
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };

// HomeMap Component: Displays a map with multiple markers
const HomeMap = ({ locations }) => {
  const [map, setMap] = useState(null); // Stores the map instance
  const boundsRef = useRef(null); // Stores the map bounds reference

  // Update map bounds when locations change
  useEffect(() => {
    if (map && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds(); // Create new bounds object

      const santaCruz = locations.filter( // Filter locations specific to Santa Cruz
        (location) => location.city === "Santa Cruz",
      );
      // Expand bounds to include all Santa Cruz locations
      santaCruz.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      // Fit map to the bounds for proper zoom level
      map.fitBounds(bounds);
      // Store bounds in ref
      boundsRef.current = bounds;
    }
  }, [map, locations]); // Runs whenever map or locations update

  return (
    // Load the Google Maps API with API Key
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      {/* Google Map Component */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={defaultCenter}
        onLoad={setMap}
      >
        {/* Render multiple markers for each location */}
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
