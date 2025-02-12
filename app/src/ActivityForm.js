import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
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
import { fetchStates, fetchCities } from "./apiService"


const ActivityForm = () => {
  const navigate = useNavigate();

  const [placeName, setPlaceName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Fetch states on mount
  useEffect(() => {
    const getStates = async () => {
      setLoadingStates(true);
      try {
        const fetchedStates = await fetchStates();
        setStates(fetchedStates);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
      setLoadingStates(false);
    };
    getStates();
  }, []);

  // Fetch cities when a state is selected
  useEffect(() => {
    if (selectedState) {
      setLoadingCities(true);
      fetchCities(selectedState.iso2)
        .then((fetchedCities) => {
          setCities(fetchedCities);
          setLoadingCities(false);
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          setCities([]);
          setLoadingCities(false);
        });
    } else {
      setCities([]);
    }
  }, [selectedState]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedCity) {
      alert("Please select a valid state and city.");
      return;
    }

    try {
      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        selectedState: selectedState.name,
        selectedCity,
        description,
        rating,
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
            getOptionLabel={(option) => option.name}
            value={selectedState}
            onChange={(event, newValue) => {
              setSelectedState(newValue);
              setSelectedCity(null); // Reset city when state changes
            }}
            loading={loadingStates}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State"
                required
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: loadingStates ? <CircularProgress size={20} /> : null,
                }}
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* City Dropdown */}
          <Autocomplete
            options={cities}
            value={selectedCity}
            onChange={(event, newValue) => setSelectedCity(newValue)}
            disabled={!selectedState || loadingCities}
            loading={loadingCities}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                required
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: loadingCities ? <CircularProgress size={20} /> : null,
                }}
              />
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