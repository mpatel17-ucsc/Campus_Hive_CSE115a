import {
  Button,
  Card,
  Box,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";

import { db } from "../Firebase";

import { ThumbUp, ThumbDown } from "@mui/icons-material";

import { doc, updateDoc, increment } from "firebase/firestore";

const ActivityCard = ({ activity, onVote }) => {
  const handleVote = async (type) => {
    try {
      const activityRef = doc(db, "activities", activity.id);
      await updateDoc(activityRef, {
        [type]: increment(1),
      });

      // Notify parent component to refresh data
      onVote();
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
      <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="200"
          image="https://source.unsplash.com/400x300/?travel"
          alt="Activity"
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {activity.locationName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {activity.city}, {activity.state}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {activity.description}
          </Typography>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
            ⭐ {activity.rating} / 5
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
          </Typography>

          {/* Upvote / Downvote Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              startIcon={<ThumbUp />}
              onClick={() => handleVote("upvotes")}
            >
              {activity.upvotes || 0}
            </Button>
            <Button
              startIcon={<ThumbDown />}
              onClick={() => handleVote("downvotes")}
            >
              {activity.downvotes || 0}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ActivityCard;
