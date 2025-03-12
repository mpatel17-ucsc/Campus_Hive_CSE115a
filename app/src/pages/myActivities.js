import React, { useState, useEffect, useCallback } from "react";
import { auth, storage, db } from "../util/firebase"; // Ensure storage is exported in your firebase util
import { Grid, Button } from "@mui/material";
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
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  
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
        <TopBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          tags={[]}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />

        <Container sx={{ textAlign: "center", mt: 12 }}>
          <Typography variant="h5">No posts yet. Click on the Create Activity button to get started!</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/create-activity")} sx={{ mt: 2 }}>
            Create Activity
          </Button>
        </Container>
      </>
    );
  }

  return (
    <Container maxWidth="md">
      <TopBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tags={[]}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
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
        sx={{ alignItems: 'flex-start' }}
      >
        {activities.map((activity) => (
          <Box key={activity.id} sx={{ width: 'calc(33.33% - 16px)', marginBottom: 2 }}>
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
  
//  return (
//    <>
//      <TopBar
//        searchTerm={searchTerm}
//        setSearchTerm={setSearchTerm}
//        tags={tags}
//        selectedTags={selectedTags}
//        setSelectedTags={setSelectedTags}
//      />
//      <h1>My Activities</h1>
//      <hr style={{ width: "100%", border: "1px solid #ccc" }} />
//      <Grid container spacing={2}>
//        {activities.map((activity) => (
//          <ActivityCard
//            key={activity.id}
//            activity={activity}
//            owner={true}
//            onDelete={handleDelete(activity.id)}
//          />
//        ))}
//      </Grid>
//    </>
//  );

};

export default MyActivities;
