import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
// import { Autocomplete } from "@mui/lab/Autocomplete";
import {states} from "./locationData";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Autocomplete,
  Rating,
} from "@mui/material";


const ActivityForm = () => {
  const navigate = useNavigate();

  const [placeName, setPlaceName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [cities, setCities] = useState([]); // Store fetched cities
  const [loadingCities, setLoadingCities] = useState(false); // Loading state for API
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  // Fetch real cities when a state is selected
  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    } else {
      setCities([]); // Reset city list when state changes
    }
  }, [selectedState]);

  const fetchCities = async (state) => {
    setLoadingCities(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?state=${state}&country=USA&featureClass=P&format=json`
      );
      const data = await response.json();
  
      // Extract and filter only city names (avoid duplicates)
      const cityNames = [...new Set(data.map((place) => place.display_name.split(",")[0]))]
        .filter((name) => name !== state); // Remove state name if it appears
  
      setCities(cityNames.length > 0 ? cityNames : ["No cities found"]);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities(["No cities found"]); // Handle API errors gracefully
    }
    setLoadingCities(false);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if a valid city and state are selected
    if (!selectedState || !selectedCity) {
      alert("Please select a valid city and state.");
      return;
    }

    try {
      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        selectedCity,
        selectedState,
        description,
        rating, // Store the creator's rating
        createdAt: serverTimestamp(),
      });

      navigate("/home", { state: { message: "Activity posted successfully!" } });
    } catch (error) {
      console.error("Error posting activity:", error);
      alert("An error occurred while posting the activity. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          marginTop: 5,
          borderRadius: 3,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create an Activity Post
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Place Name Input */}
          <TextField
            label="Place Name"
            variant="outlined"
            fullWidth
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          {/* State Dropdown */}
          <Autocomplete
            options={states}
            value={selectedState}
            onChange={(event, newValue) => {
              setSelectedState(newValue);
              setSelectedCity(null); // Reset city when state changes
            }}
            renderInput={(params) => (
              <TextField {...params} label="State" required fullWidth />
            )}
            sx={{ mb: 3 }}
          />

          {/* City Dropdown */}
          <Autocomplete
            options={cities}
            value={selectedCity}
            onChange={(event, newValue) => setSelectedCity(newValue)}
            disabled={!selectedState || loadingCities} // Disable until state is selected
            renderInput={(params) => (
              <TextField {...params} label="City" required fullWidth />
            )}
            sx={{ mb: 3 }}
          />

          {/* Description Input */}
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          {/* Rating System (Star Rating) */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography sx={{ mr: 2 }}>Rating:</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={0.5} // Allows 0.5 star increments
            />
          </Box>

          {/* Submit and Cancel Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ width: "48%", fontWeight: "bold" }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ width: "48%", fontWeight: "bold" }}
              onClick={() => navigate("/home")}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ActivityForm;
