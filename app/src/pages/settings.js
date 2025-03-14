import React, { useState, useEffect, useCallback } from "react";
import { auth, storage, db } from "../util/firebase"; // Ensure storage is exported in your firebase util
import { updateDoc, getDoc, doc } from "firebase/firestore";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import TopBar from "../components/TopBar";
import {
  Stack,
  Container,
  Box,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Typography,
  Divider,
  Switch,
} from "@mui/material";

import {
  NotificationsOff as NotificationsOffIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

const Settings = () => {
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_maps;
  // State variables for user and avatar file upload
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState("");
  const [avatarErrorMessage, setAvatarErrorMessage] = useState("");

  // New state variables for updating display name
  const [displayName, setDisplayName] = useState("");
  const [displayNameSuccessMessage, setDisplayNameSuccessMessage] =
    useState("");
  const [displayNameErrorMessage, setDisplayNameErrorMessage] = useState("");
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false);

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
      setDisplayNameErrorMessage(
        "Failed to update display name. Please try again.",
      );
    }
    setUpdatingDisplayName(false);
  };

  const [fetchedNotiSettings, setFetchedNotiSettings] = useState({});
  const [notiSettings, setNotiSettings] = useState({});
  const [zipCode, setZipCode] = useState("");
  const [validZipSelected, setValidZipSelected] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user notification settings
  const fetchUserInfo = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data().notiSettings || { allow: false, zip: "" };
        setFetchedNotiSettings(data);
        setNotiSettings(data);
        setZipCode(data.zip);
        setValidZipSelected(!!data.zip);
      } else {
        console.log("No such user!");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Handle toggle notifications
  const handleToggleNotifications = () => {
    const newAllowState = !notiSettings.allow;

    if (!newAllowState) {
      // setZipCode(""); // Clear ZIP when disabling notifications
      setValidZipSelected(false);
    }

    setNotiSettings((prev) => ({ ...prev, allow: newAllowState }));
    setHasChanges(true);
  };

  // Handle ZIP code text input
  const handleZipChange = (e) => {
    setZipCode(e.target.value);
    setValidZipSelected(false); // Reset valid ZIP selection
    setHasChanges(true);
  };

  // Handle ZIP code selection from Google Places API dropdown
  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.address_components) {
        const zip = place.address_components.find((comp) =>
          comp.types.includes("postal_code"),
        )?.short_name;
        if (zip) {
          setZipCode(zip);
          setValidZipSelected(true); // ZIP is now valid
          setHasChanges(true);
        }
      }
    }
  };

  // Handle Save button click
  const handleNotis = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedData = {
      "notiSettings.allow": notiSettings.allow,
      "notiSettings.zip": notiSettings.allow ? zipCode : "",
    };

    try {
      await updateDoc(doc(db, "users", user.uid), updatedData);
      setFetchedNotiSettings({ allow: notiSettings.allow, zip: zipCode });
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  // Check if Save button should be enabled
  const isSaveDisabled =
    !hasChanges || (notiSettings.allow && !validZipSelected);
  // (!notiSettings.allow && zipCode.trim() !== ""); // ZIP must be empty when notifications are off

  // -----------------------------------------------------------------------------------------

  return (
    <Box
      sx={{
        backgroundColor: "#fafafa",
        minHeight: "100vh",
        paddingTop: "64px",
      }}
    >
      <TopBar showSearch={false} />
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
          }}
        >
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
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
            {updatingDisplayName ? (
              <CircularProgress size={24} />
            ) : (
              "Update Display Name"
            )}
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notifications
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              edge="end"
              checked={notiSettings.allow}
              onChange={handleToggleNotifications}
              inputProps={{ "aria-label": "toggle notifications" }}
            />
            {notiSettings.allow ? (
              <NotificationsActiveIcon color="primary" />
            ) : (
              <NotificationsOffIcon color="disabled" />
            )}
            {notiSettings.allow && (
              <>
                <Typography variant="body1">
                  Get notified for activities in
                </Typography>
                <LoadScript
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  libraries={["places"]}
                >
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceSelected}
                    restrictions={{ country: "us" }} // Restrict to the US
                    options={{ types: ["(regions)"] }} // Prioritize regions (ZIPs included)
                  >
                    <Box sx={{ width: "100%", maxWidth: 400 }}>
                      <TextField
                        fullWidth
                        label="Enter ZIP Code"
                        variant="outlined"
                        value={zipCode}
                        onChange={handleZipChange}
                      />
                    </Box>
                  </Autocomplete>
                </LoadScript>
              </>
            )}
          </Stack>

          <Button
            disabled={isSaveDisabled}
            variant="outlined"
            onClick={handleNotis}
          >
            Save
          </Button>
        </Box>

        {/* Additional Settings Components can be added below */}
      </Container>
    </Box>
  );
};

export default Settings;
