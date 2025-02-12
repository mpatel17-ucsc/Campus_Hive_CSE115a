import React, { useState } from "react";
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
} from "@mui/material";

const ActivityForm = () => {
  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const navigate = useNavigate();

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

    try {
      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        city,
        state,
        description,
        rating,
        tags, // Store the tags array
        createdAt: serverTimestamp(),
      });

      navigate("/home", { state: { message: "Activity posted successfully!" } });
    } catch (error) {
      console.error("Error posting activity:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ padding: 3, marginTop: 5, borderRadius: 2, textAlign: "center" }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create an Activity Post
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Place Name"
            variant="outlined"
            fullWidth
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="City"
            variant="outlined"
            fullWidth
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="State"
            variant="outlined"
            fullWidth
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Rating (0-5)"
            type="number"
            inputProps={{ step: 0.5, min: 0, max: 5 }}
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            required
            sx={{ mb: 2 }}
          />

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
              sx={{ width: "48%" }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ width: "48%" }}
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
