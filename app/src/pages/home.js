import { db, auth } from "../util/firebase";
import TopBar from "../components/TopBar";
import ActivityCard from "../components/ActivityCard";
import HomeMap from "../components/HomeMap";

import React, { useEffect, useState, useMemo} from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { Container, CircularProgress, Box, Alert, Grid} from "@mui/material";
import UniversityHome from "../components/UniversityHome";


const Home = () => {
  // State variables
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();
  const [sortBy, setSortBy] = useState("");

  // Retrieve Success message of navigation state
  const successMessage = location.state?.message || "";

  // State variables for search and tag filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const userID = auth.currentUser.uid;

  // State for university selection
  const [selectedUniversity, setSelectedUniversity] = useState("");

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
        (activity.locationName && activity.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  if (selectedTags.length > 0) {
    filtered = filtered.filter((activity) => selectedTags.every((tag) => activity.tags?.includes(tag)));
  }

  // Filter by selected university
  if (selectedUniversity) {
    filtered = filtered.filter((activity) => activity.selectedUniversity === selectedUniversity);
  }

  // Sorting logic
  if (sortBy === "highestRated") {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "mostPopular") {
    filtered = [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  setFilteredActivities(filtered);
}, [searchTerm, selectedTags, activities, sortBy, selectedUniversity]);

  const [myActs, others] = useMemo(() => {
    return filteredActivities.reduce(
      ([matches, nonMatches], activity) => {
        if (activity.userID === userID) {
          matches.push(activity);
        } else {
          nonMatches.push(activity);
        }
        return [matches, nonMatches];
      },
      [[], []],
    );
  }, [filteredActivities, userID]);

  let locations = activities
    .map((activity) => activity.location) // Extract locations
    .filter((location) => location !== null && location !== undefined); // Remove null/undefined
  console.log("locations", locations);

  const handleDelete = (id) => async () => {
    console.log("partent", id);
    try {
      await deleteDoc(doc(db, "activities", id));
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleUniversitySelect = (university) => {
    console.log("Selected University:", university)
    setSelectedUniversity(university);
  };

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
      sortBy={sortBy} // Pass sortBy state
      setSortBy={setSortBy} // Pass sorting function
      />

      {/* University Dropdown from UniversityHome component */}
      <Box sx={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", mb: 4 }}>
        <UniversityHome onSelectUniversity={handleUniversitySelect} />
      </Box>
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
          <HomeMap locations={locations} />

          <Grid container spacing={2}>
            {others.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Grid>
          <h1>My Activities</h1>
          <hr style={{ width: "100%", border: "1px solid #ccc" }} />
          <Grid container spacing={2}>
            {myActs.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                owner={true}
                onDelete={handleDelete(activity.id)}
              />
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default Home;
