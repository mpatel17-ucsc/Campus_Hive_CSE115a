import React, { useState, useEffect } from "react";
import { auth, storage } from "../util/firebase"; // Ensure storage is exported in your firebase util
import TopBar from "../components/TopBar";
import { 
  Container, 
  Box, 
  Avatar, 
  Button, 
  CircularProgress, 
  Alert, 
  TextField, 
  Typography, 
  Divider 
} from "@mui/material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

const Settings = () => {
  // State variables for user and avatar file upload
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState("");
  const [avatarErrorMessage, setAvatarErrorMessage] = useState("");

  // New state variables for updating display name
  const [displayName, setDisplayName] = useState("");
  const [displayNameSuccessMessage, setDisplayNameSuccessMessage] = useState("");
  const [displayNameErrorMessage, setDisplayNameErrorMessage] = useState("");
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false);

  // These state variables and default props for TopBar prevent errors
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const tags = []; // Default empty array; adjust if needed

  // Set current user from Firebase Auth and initialize displayName
  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setDisplayName(auth.currentUser.displayName || "");
    }
  }, []);

  // Handle file selection for avatar update
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Upload the selected avatar and update user profile
  const handleUpload = async () => {
    if (!avatarFile || !user) return;
    setUploading(true);
    setAvatarSuccessMessage("");
    setAvatarErrorMessage("");

    const storageRef = ref(storage, `avatars/${user.uid}`);
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, avatarFile);
      // Retrieve the file's download URL
      const downloadURL = await getDownloadURL(storageRef);
      // Update the user's profile with the new photo URL
      await updateProfile(user, { photoURL: downloadURL });
      setAvatarSuccessMessage("Avatar updated successfully!");
      // Update local state to reflect the new avatar
      setUser({ ...user, photoURL: downloadURL });
      setAvatarFile(null);
    } catch (error) {
      console.error("Error updating avatar:", error);
      setAvatarErrorMessage("Failed to update avatar. Please try again.");
    }
    setUploading(false);
  };

  // ------------------------- New Component: Update Display Name -------------------------
  // Function to update the display name in the user's profile
  const handleDisplayNameUpdate = async () => {
    if (!user) return;
    setUpdatingDisplayName(true);
    setDisplayNameSuccessMessage("");
    setDisplayNameErrorMessage("");

    try {
      await updateProfile(user, { displayName: displayName });
      setDisplayNameSuccessMessage("Display name updated successfully!");
      // Update local state to reflect the new display name
      setUser({ ...user, displayName: displayName });
    } catch (error) {
      console.error("Error updating display name:", error);
      setDisplayNameErrorMessage("Failed to update display name. Please try again.");
    }
    setUpdatingDisplayName(false);
  };
  // -----------------------------------------------------------------------------------------

  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh", paddingTop: "64px" }}>
      <TopBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <Container sx={{ mt: 4 }}>
        {/* Avatar Update Section */}
        {avatarSuccessMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {avatarSuccessMessage}
          </Alert>
        )}
        {avatarErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {avatarErrorMessage}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
          <Avatar
            src={user?.photoURL || "/default-avatar.png"}
            sx={{ width: 100, height: 100 }}
          />
          <input
            accept="image/*"
            type="file"
            onChange={handleFileChange}
            style={{ marginTop: "20px" }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : "Update Avatar"}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Display Name Update Section */}
        {displayNameSuccessMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {displayNameSuccessMessage}
          </Alert>
        )}
        {displayNameErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {displayNameErrorMessage}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Update Display Name
          </Typography>
          <TextField
            label="Display Name"
            variant="outlined"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            sx={{ width: "100%", maxWidth: 400 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleDisplayNameUpdate}
            disabled={updatingDisplayName}
          >
            {updatingDisplayName ? <CircularProgress size={24} /> : "Update Display Name"}
          </Button>
        </Box>

        {/* Additional Settings Components can be added below */}
      </Container>
    </Box>
  );
};

export default Settings;