import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

// Import Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_maps;

// Define the styling for the map container
const mapContainerStyle = {
  width: "100%", // Takes full width of the container
  height: "400px", // Fixed height for visibility
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

const LocationPicker = ({ onLocationSelect }) => {
  // State to keep track of the Google Map instance
  const [map, setMap] = useState(null);
  // State to store the selected marker position
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  // Reference for Google Places Autocomplete
  const autocompleteRef = useRef(null);

  // Callback function that sets the Google Map instance when it loads
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // Monitors when the map is set and logs a message for debugging
  useEffect(() => {
    if (map) {
      console.log("Map has been set:", map);
    }
  }, [map]);

  // Triggered when a user selects a place from the autocomplete suggestions.
  // Extracts the latitude, longitude, city, and state of the selected place.
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      // Get place details from the Autocomplete instance
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        // Extract latitude and longitude from the selected place
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        // Extract City & State from Place API
        let city = "";
        let state = "";
        
        // Extract ZIP code if available
        const zip = place.address_components.find((comp) =>
          comp.types.includes("postal_code"),
        )?.short_name;
        
        // Loop through address components to find city and state
        for (const component of place.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name; // Assign the city
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name; // Assign the state
          }
        }

        // Update the marker position on the map
        setMarkerPosition(coords);

        // Pass the selected location data to the parent component
        if (city && state && coords && zip) {
          onLocationSelect({ city, state, ...coords, zip });
        }
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      {/* Container to align the search box and map vertically */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Search Box: Uses Google Places Autocomplete to help users find locations */}
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} // Store the autocomplete instance in a ref
          onPlaceChanged={onPlaceChanged} // Triggered when a user selects a location
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

        {/* Google Map Component: Displays the selected location */}
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
