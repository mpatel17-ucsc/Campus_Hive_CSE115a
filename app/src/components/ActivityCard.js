import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  MobileStepper,
} from "@mui/material";

import SwipeableViews from "react-swipeable-views";

import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ThumbUp,
  ThumbDown,
  Room,
  Close,
} from "@mui/icons-material";
import { useState } from "react";
import { db, auth } from "../util/firebase";
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

const ActivityCard = ({ activity, owner = false, onDelete }) => {
  // Get the currently logged-in user from Firebase Auth
  const user = auth.currentUser; 
  // reference to the Firestore document for this specific activity
  const activityRef = doc(db, "activities", activity.id);
  // State to keep track of the active image step in the SwipeableViews
  const [activeStep, setActiveStep] = useState(0);
  let mapsUrl = "";
  // If the activity selected has a valid lat and long, generate a Google Maps link
  if (activity.location && activity.location.lat && activity.location.lng) {
    const coords = `${activity.location.lat},${activity.location.lng}`;
    mapsUrl = `https://www.google.com/maps?q=${coords}`;
  }

  // state to check if the user has upvoted the activity before
  const [hasUpvoted, setHasUpvoted] = useState(
    // check if userID is in the upvotedBy array to avoid duplication
    activity.upvotedBy?.includes(user.uid),
  );

  // state to check if the user has downvoted the activity before
  const [hasDownvoted, setHasDownvoted] = useState(
    // check if userID is in the downvotedBy array to avoid duplication
    activity.downvotedBy?.includes(user.uid),
  );

  // state to manage whether the delete confirmation dialog is open
  const [openDialog, setOpenDialog] = useState(false);
  
  // state to store the current number of upvotes for an activity
  const [upvotes, setUpvotes] = useState(activity.upvotes || 0);

  // state to store the current number of downvotes for an activity
  const [downvotes, setDownvotes] = useState(activity.downvotes || 0);

  // Handle the deletion of an activity
  const handleDelete = () => {
    // close the confirmation dialog before proceeding with deletion
    setOpenDialog(false);
    // check if the onDelete function was passed, and if so, call the function to perform the deletion
    if (onDelete) {
      onDelete();
    }
  };

  // If user images exist, append them after the static map image.
  const init = activity.imageUrls || [];
  let imagesToDisplay = init;
  // keep track of the total images
  const totalImages = imagesToDisplay.length;

  // function to handle voting (upvotes & downvotes)
  const handleVote = async (type) => {
    try {
      // retrieve Firestore document. If it exists, proceed with vote updates
      const activitySnap = await getDoc(activityRef);
      if (activitySnap.exists()) {
        // get the user unique ID
        const userId = user.uid;
        // object to store updates for Firestore
        let updateData = {};

        // Handle case of UPVOTE
        if (type === "upvotes") {
          if (hasUpvoted) {
            // If already upvoted, remove the upvote
            updateData = {
              // decrease upvote count
              upvotes: increment(-1),
              // remove the user from the upvote list
              upvotedBy: arrayRemove(userId),
            };
            // update local state to reflect removal
            setHasUpvoted(false);
            // decrease the upvote count in UI
            setUpvotes((prev) => prev - 1);
          } else {
            // If downvoted before, remove downvote and add upvote
            updateData = {
              // increase the upvote count in Firestore
              upvotes: increment(1),
              // add user ID to upvoted list
              upvotedBy: arrayUnion(userId),
              ...(hasDownvoted && {
                // decrease downvote count
                downvotes: increment(-1),
                // remove user from downvoted array
                downvotedBy: arrayRemove(userId),
              }),
            };

            if (hasDownvoted) {
              // update downvote count in UI
              setDownvotes((prev) => prev - 1);
              // set hasDownvoted to false
              setHasDownvoted(false);
            }
            // mark user as upvoted
            setHasUpvoted(true);
            // increase upvote count in the UI
            setUpvotes((prev) => prev + 1);
          }
        } 
        
        // handle the case when the user is DOWNVOTING
        else if (type === "downvotes") {
          if (hasDownvoted) {
            // If already downvoted, remove the downvote
            updateData = {
              downvotes: increment(-1), // Decrease downvote count in Firestore
              downvotedBy: arrayRemove(userId), // Remove user ID from downvoted list
            };
            setHasDownvoted(false); // Update local state
            setDownvotes((prev) => prev - 1); // Decrease downvote count in UI
          } else {
            // If the user had previously upvoted, remove that upvote first
            updateData = {
              downvotes: increment(1), // Increase downvote count in Firestore
              downvotedBy: arrayUnion(userId), // Add user ID to downvoted list
              ...(hasUpvoted && {
                upvotes: increment(-1), // Decrease upvote count
                upvotedBy: arrayRemove(userId), // Remove user from upvoted list
              }),
            };
            if (hasUpvoted) {
              setUpvotes((prev) => prev - 1); // Update upvote count in UI
              setHasUpvoted(false); // Set hasUpvoted to false
            }
            setHasDownvoted(true); // Mark user as downvoted
            setDownvotes((prev) => prev + 1); // Increase downvote count in UI
          }
        }
        // Update Firestore with the new upvote/downvote values
        await updateDoc(activityRef, updateData);
      }
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };


  // Handle moving on to the next image
  const handleNext = () => {
    // ensure that we don't go beyond the last image
    if (activeStep < totalImages - 1) {
      // move to the next image
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  // Handle moving to the previous image
  const handleBack = () => {
    // ensure we don't go below the first image
    if (activeStep > 0) {
      // move to the previous image
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  return (
    // Grid Layout and Card Container
    <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
      <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>

        {/* Remove Button (Only if Owner) */}
        {owner && (
          <>
            {/* Open a confirmation dialog and be able to delete an activity */}
            <IconButton onClick={() => setOpenDialog(true)}>
              <Close />
            </IconButton>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this activity? This action
                  cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleDelete} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Image Navigation UI */}
        {totalImages > 0 && (
          <Box sx={{ position: "relative" }}>
            {/* Swipeable Image Carousel */}
            <SwipeableViews index={activeStep} onChangeIndex={setActiveStep}>
              {imagesToDisplay.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="200"
                  image={image}
                  alt={index === 0 ? "Location Map" : `Activity Image ${index}`}
                  sx={{ objectFit: "cover" }} // Ensures the image is well-proportioned
                />
              ))}
            </SwipeableViews>

            {/* Navigation Dots Overlay (Instagram-style) */}
            {totalImages > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10, // Adjusts position inside the image
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "5px",
                  backgroundColor: "rgba(0, 0, 0, 0.2)", // Transparent background for better visibility
                  padding: "5px 10px",
                  borderRadius: "15px", // Smooth rounded effect
                }}
              >
                {imagesToDisplay.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: activeStep === index ? "10px" : "8px", // Slightly bigger for active dot
                      height: activeStep === index ? "10px" : "8px",
                      backgroundColor: activeStep === index ? "#fff" : "rgba(255, 255, 255, 0.5)",
                      borderRadius: "50%",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            )}

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

        {/* Activity Information */}

        {/* Display the name of the activity location */}
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {activity.locationName}
          </Typography>

          {/* Display the Location including the Google Maps link button (City, State) */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="textSecondary">
              {activity.location?.city}, {activity.location?.state}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => window.open(mapsUrl, "_blank")}
              sx={{ ml: 0.5 }}
            >
              <Room fontSize="small" />
            </IconButton>
          </Box>

          {/* Displaying the College Name */}
          {activity.selectedUniversity && (
            <Typography variant="body2" color="textSecondary">
              <strong>College: </strong>{activity.selectedUniversity}
            </Typography>
          )}

          {/* Display activity description and user-submitted rating out of 5 */}
          <Typography variant="body1" sx={{ mt: 1 }}>
            {activity.description}
          </Typography>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
            ⭐ {activity.rating} / 5
          </Typography>

          {/* Convert Firebase timstamp to readable data for the user */}
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
              sx={{ color: hasUpvoted ? "green" : "default" }}
            >
              {upvotes}
            </Button>
            <Button
              startIcon={<ThumbDown />}
              onClick={() => handleVote("downvotes")}
              sx={{ color: hasDownvoted ? "red" : "default" }} 
            >
              {downvotes}
            </Button>
          </Box>
          {/* Display the comment section */}
          <CommentsSection activityId={activity.id} />
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ActivityCard;
