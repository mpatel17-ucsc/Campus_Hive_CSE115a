import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "./Firebase";
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

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 1;
const MAX_TOTAL_IMAGES = 30;
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];
const ActivityForm = () => {
  const user = auth.currentUser;
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

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const fileInputRef = useRef(null);
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Drag-and-Drop logic
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: ALLOWED_FORMATS.join(","), // Accept only images
      maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
      onDrop: (acceptedFiles, fileRejections) => {
        // Handle errors
        if (fileRejections.length > 0) {
          alert("Some files were rejected. Please upload valid images only.");
          return;
        }

        if (imageFiles.length + acceptedFiles.length > MAX_IMAGES) {
          alert(`You can only upload up to ${MAX_IMAGES} images.`);
          return;
        }

        // Add new images to previews
        setImageFiles((prev) => [...prev, ...acceptedFiles]);
        setImagePreviews((prev) => [
          ...prev,
          ...acceptedFiles.map((file) => URL.createObjectURL(file)),
        ]);
      },
    });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (imageFiles.length + files.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getUserImageCount = async (userID) => {
    try {
      const userFolderRef = ref(storage, `images/${userID}/`);
      const fileList = await listAll(userFolderRef);

      console.log(`${userID} has ${fileList.items.length} images.`);
      return fileList.items.length;
    } catch (error) {
      console.error("Error fetching user image count from Storage:", error);
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedCity) {
      alert("Please select a valid state and city.");
      return;
    }

    const userID = user.uid;
    try {
      if ((await getUserImageCount(userID)) > MAX_TOTAL_IMAGES) {
        console.log("exceeded image limit");
        alert("exceeded image limit");
        return;
      }

      let downloadURLs = [];
      if (imageFiles.length > 0) {
        console.log(imageFiles);
        for (const file of imageFiles) {
          const name = `${Date.now()}-${file.name}`;
          const storageRef = ref(storage, `images/${userID}/${name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          downloadURLs.push(url);
        }
      }

      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        state: selectedState.name,
        city: selectedCity,
        description,
        rating,
        tags, // Store the tags array
        createdAt: serverTimestamp(),
        userID: user.uid,
        userName: user.displayName,
        imageUrls: downloadURLs.length > 0 ? downloadURLs : null, // Store as an array
      });

      console.log("Files uploaded successfully:", downloadURLs);

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
          {/* <Box component="form" sx={{ mt: 2 }}> */}
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
            {/* <TextField */}
            {/*   label="Rating (0-5)" */}
            {/*   type="number" */}
            {/*   inputProps={{ step: 0.5, min: 0, max: 5 }} */}
            {/*   value={rating} */}
            {/*   onChange={(e) => setRating(parseFloat(e.target.value))} */}
            {/*   required */}
            {/* />{" "} */}
          </Box>

          <Box>
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple // Enables multiple file selection
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {/* Upload Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
            >
              Upload Images
            </Button>
            <Typography sx={{ mb: 2 }}>(Up to 5)</Typography>

            {/* Drag-and-Drop UI Box */}
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #1976d2",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: isDragActive ? "#e3f2fd" : "#f9f9f9",
                color: isDragReject ? "red" : "#1976d2",
                mb: 3,
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography variant="body1">
                  Drop your images here...
                </Typography>
              ) : (
                <Typography variant="body1">
                  Drag & drop images here, or click to select files (Max{" "}
                  {MAX_IMAGES})
                </Typography>
              )}
            </Box>

            {/* Preview Images */}
            {imagePreviews.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Preview:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                  {imagePreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          maxWidth: "150px",
                          height: "auto",
                          borderRadius: 8,
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          minWidth: "30px",
                          padding: "2px 6px",
                          fontSize: "10px",
                        }}
                        onClick={() => removeImage(index)}
                      >
                        X
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

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

            {/* <Button */}
            {/*   variant="outlined" */}
            {/*   color="secondary" */}
            {/*   sx={{ width: "48%" }} */}
            {/*   onClick={handleSubmit} */}
            {/*   // onClick={() => getUserImageCount(user.uid)} */}
            {/* > */}
            {/*   test uplaad */}
            {/* </Button> */}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ActivityForm;
