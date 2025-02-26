import React, { useEffect, useState } from "react";
import { Container, CircularProgress, Box, Alert, Grid } from "@mui/material";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import ActivityCard from "./components/ActivityCard";

const HomeComponent = () => {
  // State variables 
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  // const [successMessage, setSuccessMessage] = useState(
  //   location.state?.message || "",
  // );

  // Retrieve Success message of navigation state
  const successMessage = location.state?.message || "";

  // State variables for search and tag filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // Function to fetch activities from Firestore
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch all activity documents
      const querySnapshot = await getDocs(collection(db, "activities"));
      const activitiesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActivities(activitiesList);
      setFilteredActivities(activitiesList);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    setLoading(false);
  };
   // Function to extract unique tags from all activities
  const getUniqueTags = () => {
    const tags = new Set();
    activities.forEach((activity) => {
      activity.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };
  // Fetch activities when component mounts and handle success message timeout
  useEffect(() => {
    fetchActivities();
    if (successMessage) {
      setFadeOut(false);
      const timer = setTimeout(() => setFadeOut(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  // Filter activities whenever search term, selected tags, or activities change
  useEffect(() => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          (activity.locationName &&
            activity.locationName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (activity.description &&
            activity.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }
    // Filter only based on selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((activity) =>
        selectedTags.every((tag) => activity.tags?.includes(tag)),
      );
    }

    setFilteredActivities(filtered);
  }, [searchTerm, selectedTags, activities]);

  return (
    <Box
      sx={{
        backgroundColor: "#fafafa",
        minHeight: "100vh",
        paddingTop: "64px",
      }}
    >
      <TopBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tags={getUniqueTags()}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 4 }}>
          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                opacity: fadeOut ? 0 : 1,
                transition: "opacity 0.5s ease-out",
              }}
            >
              {successMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onVote={fetchActivities}
              />
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default HomeComponent;
