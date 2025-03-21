import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../util/firebase"; // Ensure storage is exported in your firebase util
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import ActivityCard from "../components/ActivityCard";
import { Container, Typography, Divider, Stack, Box } from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const MyActivities = () => {
  // Function to fetch activities from Firestore
  const userID = auth.currentUser.uid;
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);

  const fetchActivities = useCallback(async () => {
    try {
      const activitiesQuery = query(
        collection(db, "activities"),
        where("userID", "==", userID),
      );
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivities(activitiesList);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [userID]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleDelete = (id) => async () => {
    console.log("partent", id);
    try {
      await deleteDoc(doc(db, "activities", id));
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  if (!activities || !activities.length) {
    console.log("No activities");
    return (
      <>
        <TopBar showSearch={false} />

        <Container sx={{ textAlign: "center", mt: 12 }}>
          <Typography variant="h5">
            No posts yet. Click on the Create Activity button to get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-activity")}
            sx={{ mt: 2 }}
          >
            Create Activity
          </Button>
        </Container>
      </>
    );
  }

  return (
    <Container maxWidth="md">
      <TopBar showSearch={false} />
      <Container sx={{ textAlign: "center", mt: 12 }}>
        <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>
          My Activities
        </Typography>
      </Container>
      <Divider sx={{ mb: 2 }} />
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        justifyContent="flex-start"
        sx={{ alignItems: "flex-start" }}
      >
        {activities.map((activity) => (
          <Box
            key={activity.id}
            sx={{ width: "calc(33.33% - 16px)", marginBottom: 2 }}
          >
            <ActivityCard
              activity={activity}
              owner={true}
              onDelete={handleDelete(activity.id)}
            />
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default MyActivities;
