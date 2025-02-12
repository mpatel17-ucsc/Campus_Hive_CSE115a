import React, { useEffect, useState } from "react";
import { Container, CircularProgress, Box, Alert, Grid } from "@mui/material";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import ActivityCard from "./components/ActivityCard";

const HomeComponent = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "activities"));
      const activitiesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(activitiesList);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
    if (successMessage) {
      setFadeOut(false); // Reset fade-out state when new message appears
      const timer = setTimeout(() => {
        setFadeOut(true); // Start fade-out animation
      }, 2500); // Start fade-out after 2.5s

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Box
      sx={{
        backgroundColor: "#fafafa",
        minHeight: "100vh",
        paddingTop: "64px",
      }}
    >
      <TopBar />
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
                opacity: fadeOut ? 0 : 1, // Fade out smoothly
                transition: "opacity 0.5s ease-out",
              }}
            >
              {successMessage}
            </Alert>
          )}
          <Grid container spacing={2}>
            {activities.map((activity) => (
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
