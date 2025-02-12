import {
  Button,
  Card,
  Box,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Chip,
  MobileStepper,
} from "@mui/material";

import SwipeableViews from "react-swipeable-views";

import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useState } from "react";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { db, auth } from "../Firebase";

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

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = activity.imageUrls ? activity.imageUrls.length : 0;

  // const upvotes = activity.upvotes || 0;
  // const downvotes = activity.downvotes || 0;
  // const userVote = activity.votes?.[userId] || null;

  const handleNext = () => {
    if (activeStep < maxSteps - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
      <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
        {maxSteps > 0 && (
          <Box sx={{ position: "relative" }}>
            <SwipeableViews index={activeStep} onChangeIndex={setActiveStep}>
              {activity.imageUrls.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="200"
                  image={image}
                  alt={`Activity Image ${index + 1}`}
                />
              ))}
            </SwipeableViews>

            {/* Left & Right Navigation Buttons */}
            {maxSteps > 1 && (
              <>
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={maxSteps <= 1}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 5,
                    transform: "translateY(-50%)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    minWidth: "30px",
                    padding: "5px",
                  }}
                >
                  <KeyboardArrowLeft />
                </Button>
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={maxSteps <= 1}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 5,
                    transform: "translateY(-50%)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    minWidth: "30px",
                    padding: "5px",
                  }}
                >
                  <KeyboardArrowRight />
                </Button>
              </>
            )}
          </Box>
        )}
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

          {maxSteps > 1 && (
            <MobileStepper
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              nextButton={null}
              backButton={null}
              sx={{ backgroundColor: "transparent", justifyContent: "center" }}
            />
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
