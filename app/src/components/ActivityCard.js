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
import { doc, updateDoc, getDoc } from "firebase/firestore";

const ActivityCard = ({ activity, onVote, userId }) => {
  const handleVote = async (type) => {
    try {
      const activityRef = doc(db, "activities", activity.id);
      const activitySnap = await getDoc(activityRef);

      if (!activitySnap.exists()) return;

      const data = activitySnap.data();
      const votes = data.votes || {};

      // Check the user's current vote
      const currentVote = votes[userId];

      let updateData = {};
      if (currentVote === type) {
        // User is removing their vote
        updateData = {
          [type]: data[type] - 1,
          [`votes.${userId}`]: null, // Remove user's vote from Firestore
        };
      } else {
        // User is switching vote or voting for the first time
        updateData = {
          [type]: (data[type] || 0) + 1,
          [`votes.${userId}`]: type,
        };

        if (currentVote) {
          // If switching vote, remove the previous vote
          updateData[currentVote] = data[currentVote] - 1;
        }
      }

      await updateDoc(activityRef, updateData);
      onVote();
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  const upvotes = activity.upvotes || 0;
  const downvotes = activity.downvotes || 0;
  const userVote = activity.votes?.[userId] || null;

  const rating = ((upvotes - downvotes) / (upvotes + downvotes + 1)) * 5;
  const cappedRating = Math.max(0, Math.min(5, rating)); // Keep rating between 0-5

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
            ⭐ {activity.rating?.toFixed(1)} / 5
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
          </Typography>

          {/* Upvote / Downvote Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              startIcon={<ThumbUp />}
              onClick={() => handleVote("upvotes")}
              color={userVote === "upvotes" ? "primary" : "default"}
            >
              {upvotes}
            </Button>
            <Button
              startIcon={<ThumbDown />}
              onClick={() => handleVote("downvotes")}
              color={userVote === "downvotes" ? "error" : "default"}
            >
              {downvotes}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ActivityCard;