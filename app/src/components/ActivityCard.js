import {
  Button,
  Card,
  Box,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  MobileStepper,
} from "@mui/material";

import SwipeableViews from "react-swipeable-views";

import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useState } from "react";
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

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = activity.imageUrls ? activity.imageUrls.length : 0;

  const upvotes = activity.upvotes || 0;
  const downvotes = activity.downvotes || 0;
  const userVote = activity.votes?.[userId] || null;

  // const rating = ((upvotes - downvotes) / (upvotes + downvotes + 1)) * 5;
  // const cappedRating = Math.max(0, Math.min(5, rating)); // Keep rating between 0-5

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
            ⭐ {activity.rating?.toFixed(1)} / 5
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
          </Typography>

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

