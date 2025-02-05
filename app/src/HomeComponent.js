import React, { useEffect, useState } from "react";
import { Container, CircularProgress, Grid, Box } from "@mui/material";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import TopBar from "./components/TopBar";
import ActivityCard from "./components/ActivityCard";

const HomeComponent = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

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
