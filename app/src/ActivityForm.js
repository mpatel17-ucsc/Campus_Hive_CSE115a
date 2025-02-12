import React, { useState, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
} from "@mui/material";

const ActivityForm = () => {
  //async function test() {
  //  // console.log(imageFile.name);
  //  // console.log(user);
  //  // return;
  //  // if (!imageFile) return;
  //}
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");

  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]); // Array of images
  const [imagePreviews, setImagePreviews] = useState([]); // Array of preview URLs
  const MAX_IMAGES = 5;
  const MAX_TOTAL_IMAGES = 30;

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
        city,
        state,
        description,
        rating,
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
          {/* <Box component="form" sx={{ mt: 2 }}> */}
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
          />

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

            <Typography>(Up to 5)</Typography>

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
