import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../util/firebase"; // Ensure storage is exported in your firebase util
import { Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ActivityCard from "../components/ActivityCard";

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
  if (!activities.length) {
    return (
      <>
        <h1>
          No posts yet. Click on the Create Activity button to get started!
        </h1>
        <Button onClick={() => navigate("/create-activity")}>
          Create Activity
        </Button>
      </>
    );
  }

  return (
    <>
      <h1>My Activities</h1>
      <hr style={{ width: "100%", border: "1px solid #ccc" }} />
      <Grid container spacing={2}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            owner={true}
            onDelete={handleDelete(activity.id)}
          />
        ))}
      </Grid>
    </>
  );
};

export default MyActivities;
