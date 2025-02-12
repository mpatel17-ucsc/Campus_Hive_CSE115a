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
      const votes = data.votes || {}; // Ensure votes object exists
      const currentVote = votes[userId] || null; // Get current user vote

      let updateData = { votes: { ...votes } }; // Preserve existing votes

      if (currentVote === type) {
        // User removes their vote
        delete updateData.votes[userId]; // Remove user from votes
        updateData[type] = Math.max(0, (data[type] || 0) - 1); // Decrement count
      } else {
        // User is voting or switching votes
        updateData.votes[userId] = type;
        updateData[type] = (data[type] || 0) + 1; // Increment new vote

        if (currentVote) {
          // If switching vote, decrement old vote count
          updateData[currentVote] = Math.max(0, (data[currentVote] || 0) - 1);
        }
      }

      await updateDoc(activityRef, updateData);
      onVote(); // Refresh UI
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  const upvotes = activity.upvotes || 0;
  const downvotes = activity.downvotes || 0;
  const userVote = activity.votes?.[userId] || null;

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
            color={userVote === "upvotes" ? "primary" : "default"} // Only highlight if the user voted up
          >
            {upvotes}
          </Button>
          <Button
            startIcon={<ThumbDown />}
            onClick={() => handleVote("downvotes")}
            color={userVote === "downvotes" ? "error" : "default"} // Only highlight if the user voted down
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