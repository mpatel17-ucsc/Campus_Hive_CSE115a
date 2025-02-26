import React, { useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
// load API key
// declare constants
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_maps;

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

const LocationPicker = ({ onLocationSelect }) => {
  // State variables defined here
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const autocompleteRef = useRef(null);
  // Set map when loaded
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };
  // When place has changed 
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        // Get lat/lng
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        // Extract City & State from Place API
        let city = "";
        let state = "";

        for (const component of place.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
        }
        console.log("City:", city, "State:", state);

        setMarkerPosition(location);

        // Pass data to parent
        if (city && state) {
          onLocationSelect({ city, state });
        }
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Search Box */}
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a location..."
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </Autocomplete>

        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={markerPosition}
          onLoad={onLoad}
        >
          {/* Marker on Selected Location */}
          <Marker position={markerPosition} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default LocationPicker;
