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
import { db, auth } from "../util/firebase";
import { IconButton } from "@mui/material";
import { Room } from "@mui/icons-material";
// import { debounce } from "lodash";

import CommentsSection from "./CommentSection";

import {
  doc,
  updateDoc,
  increment,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const ActivityCard = ({ activity }) => {
  const user = auth.currentUser; // Get logged-in user
  const activityRef = doc(db, "activities", activity.id);

  const [activeStep, setActiveStep] = useState(0);

  const [hasUpvoted, setHasUpvoted] = useState(
    activity.upvotedBy?.includes(user.uid),
  );
  const [hasDownvoted, setHasDownvoted] = useState(
    activity.downvotedBy?.includes(user.uid),
  );

  // const debouncedUpdate = debounce(async (updateData) => {
  //   await updateDoc(activityRef, updateData);
  // }, 500);

  const [upvotes, setUpvotes] = useState(activity.upvotes || 0);
  const [downvotes, setDownvotes] = useState(activity.downvotes || 0);

  const googleMapsApiKey = process.env.REACT_APP_maps;
  // Create a static map URL based on the location.
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
    activity.city + ", " + activity.state,
  )}&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(
    activity.city + ", " + activity.state,
  )}&key=${googleMapsApiKey}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    activity.city + ", " + activity.state,
  )}`;

  // If user images exist, append them after the static map image.
  const additionalImages = activity.imageUrls || [];
  const imagesToDisplay = [staticMapUrl, ...additionalImages];
  const totalImages = imagesToDisplay.length;

  const handleVote = async (type) => {
    try {
      const activitySnap = await getDoc(activityRef);

      if (activitySnap.exists()) {
        const userId = user.uid;

        let updateData = {};
        if (type === "upvotes") {
          if (hasUpvoted) {
            // If already upvoted, remove the upvote
            updateData = {
              upvotes: increment(-1),
              upvotedBy: arrayRemove(userId),
            };
            setHasUpvoted(false);
            setUpvotes((prev) => prev - 1);
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
            if (hasDownvoted) {
              setDownvotes((prev) => prev - 1);
              setHasDownvoted(false);
            }
            setHasUpvoted(true);
            setUpvotes((prev) => prev + 1);
          }
        } else if (type === "downvotes") {
          if (hasDownvoted) {
            // If already downvoted, remove the downvote
            updateData = {
              downvotes: increment(-1),
              downvotedBy: arrayRemove(userId),
            };
            setHasDownvoted(false);
            setDownvotes((prev) => prev - 1);
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
            if (hasUpvoted) {
              setUpvotes((prev) => prev - 1);
              setHasUpvoted(false);
            }
            setHasDownvoted(true);
            setDownvotes((prev) => prev + 1);
          }
        }

        // debouncedUpdate(updateData);
        await updateDoc(activityRef, updateData);
      }
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  const handleNext = () => {
    if (activeStep < totalImages - 1) {
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
        {totalImages > 0 && (
          <Box sx={{ position: "relative" }}>
            <SwipeableViews index={activeStep} onChangeIndex={setActiveStep}>
              {imagesToDisplay.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="200"
                  image={image}
                  alt={index === 0 ? "Location Map" : `Activity Image ${index}`}
                />
              ))}
            </SwipeableViews>

            {/* Left & Right Navigation Buttons */}
            {totalImages > 1 && (
              <>
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={totalImages <= 1}
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
                  disabled={totalImages <= 1}
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="textSecondary">
              {activity.city}, {activity.state}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => window.open(googleMapsUrl, "_blank")}
              sx={{ ml: 0.5 }} // Adds a small gap between text and icon
            >
              <Room fontSize="small" /> {/* Replace with any icon */}
            </IconButton>
          </Box>
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

          {totalImages > 1 && (
            <MobileStepper
              steps={totalImages}
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
              sx={{ color: hasUpvoted ? "green" : "default" }} // ✅ Uses default color
            >
              {upvotes}
            </Button>
            <Button
              startIcon={<ThumbDown />}
              onClick={() => handleVote("downvotes")}
              sx={{ color: hasDownvoted ? "red" : "default" }} // ✅ Uses default color
            >
              {downvotes}
            </Button>
          </Box>

          <CommentsSection activityId={activity.id} />
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ActivityCard;
