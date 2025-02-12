import {
  Button,
  Card,
  Box,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Chip,
} from "@mui/material";

import { db, auth } from "../Firebase";

import { ThumbUp, ThumbDown } from "@mui/icons-material";

import {
  doc,
  updateDoc,
  increment,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const ActivityCard = ({ activity, onVote }) => {
  const user = auth.currentUser; // Get logged-in user
  const activityRef = doc(db, "activities", activity.id);

  const handleVote = async (type) => {
    try {
      const activitySnap = await getDoc(activityRef);

      if (activitySnap.exists()) {
        const data = activitySnap.data();
        const userId = user.uid;

        // Get previous votes
        const hasUpvoted = data.upvotedBy?.includes(userId);
        const hasDownvoted = data.downvotedBy?.includes(userId);

        let updateData = {};
        if (type === "upvotes") {
          if (hasUpvoted) {
            // If already upvoted, remove the upvote
            updateData = {
              upvotes: increment(-1),
              upvotedBy: arrayRemove(userId),
            };
          } else {
            // If downvoted before, remove downvote and add upvote
            updateData = {
              upvotes: increment(1),
              upvotedBy: arrayUnion(userId),
              ...(hasDownvoted && {
                downvotes: increment(-1),
                downvotedBy: arrayRemove(userId),
              }),
            };
          }
        } else if (type === "downvotes") {
          if (hasDownvoted) {
            // If already downvoted, remove the downvote
            updateData = {
              downvotes: increment(-1),
              downvotedBy: arrayRemove(userId),
            };
          } else {
            // If upvoted before, remove upvote and add downvote
            updateData = {
              downvotes: increment(1),
              downvotedBy: arrayUnion(userId),
              ...(hasUpvoted && {
                upvotes: increment(-1),
                upvotedBy: arrayRemove(userId),
              }),
            };
          }
        }

        await updateDoc(activityRef, updateData);

        // Notify parent component to refresh data
        onVote();
      }
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

          {/* Display Tags if Available */}
          {activity.tags && activity.tags.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {activity.tags.map((tag, index) => (
                <Chip key={index} label={tag} color="primary" size="small" />
              ))}
            </Box>
          )}

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
