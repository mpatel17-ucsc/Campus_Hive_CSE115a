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
  Chip,
  CircularProgress,
  Autocomplete,
  Rating,
} from "@mui/material";
import { fetchStates, fetchCities } from "./apiService";

const ActivityForm = () => {
  const navigate = useNavigate();

  const [placeName, setPlaceName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedCity) {
      alert("Please select a valid state and city.");
      return;
    }

    try {
      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        state: selectedState.name,
        city: selectedCity,
        description,
        rating,
        tags, // Store the tags array
        createdAt: serverTimestamp(),
      });

      navigate("/home", {
        state: { message: "Activity posted successfully!" },
      });
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
                  endAdornment: loadingStates ? (
                    <CircularProgress size={20} />
                  ) : null,
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
                  endAdornment: loadingCities ? (
                    <CircularProgress size={20} />
                  ) : null,
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

          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography sx={{ mr: 2 }}>Rating:</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={0.5} // Allows 0.5 star increments
            />
          </Box>
          {/* Tag Input */}
          <TextField
            label="Add Tags"
            variant="outlined"
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTag}
            sx={{ mb: 2 }}
          >
            Add Tag
          </Button>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
              />
            ))}
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

