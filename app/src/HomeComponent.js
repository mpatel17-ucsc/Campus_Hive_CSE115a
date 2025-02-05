import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Typography, IconButton, Avatar, Container, Card, CardContent, CardMedia, CircularProgress, Grid } from "@mui/material";
import { Add as AddIcon, Home as HomeIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { auth, db } from "./Firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

const HomeComponent = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
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

    fetchActivities();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh", paddingTop: "64px" }}>
      {/* App Bar */}
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Campus Hive</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" onClick={() => navigate("/create-activity")} title="Create Post">
              <AddIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate("/home")} title="Home">
              <HomeIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => signOut(auth)} title="Logout">
              <LogoutIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#1976d2" }}>
              {auth.currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/*spinner*/ }
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Container sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            {activities.map((activity) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
                <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
                  {/* Placeholder Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image="https://source.unsplash.com/400x300/?travel"
                    alt="Activity"
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{activity.locationName}</Typography>
                    <Typography variant="body2" color="textSecondary">{activity.city}, {activity.state}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>{activity.description}</Typography>
                    <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
                      ⭐ {activity.rating} / 5
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
};
export default HomeComponent;
