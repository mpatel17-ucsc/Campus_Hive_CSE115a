import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import { ThumbUp, ThumbDown, Room, ArrowBack , ArrowForward, ArrowBackIos} from "@mui/icons-material";
import { db } from "../util/firebase";
import {
  doc,
  getDoc,
  increment,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import CommentsSection from "../components/CommentSection";

const ActivityDetail = () => {
  // Extracts the activity ID from the URL parameters
  const { id } = useParams();

  // State variables to store activity details and voting data
  const [activity, setActivity] = useState(null); // Stores the fetched activity details
  const [upvotes, setUpvotes] = useState(0); // Stores the number of upvotes
  const [downvotes, setDownvotes] = useState(0); // Stores the number of downvotes
  const [hasUpvoted, setHasUpvoted] = useState(false); // Tracks if the current user has upvoted
  const [hasDownvoted, setHasDownvoted] = useState(false); // Tracks if the current user has downvoted

  // Fetch activity details from Firestore when component mounts
  useEffect(() => {
    if (!id) {
      console.error("Activity ID is missing");
      return;
    }
    const fetchActivity = async () => {
      const activityRef = doc(db, "activities", id);
      const activitySnap = await getDoc(activityRef);
      if (activitySnap.exists()) {
        const data = activitySnap.data();
        setActivity(data); // Stores the activity data in state
        // Set initial vote counts and user voting status
        setUpvotes(data.upvotes || 0);
        setDownvotes(data.downvotes || 0);
        setHasUpvoted(data.upvotedBy?.includes(data.userID));
        setHasDownvoted(data.downvotedBy?.includes(data.userID));
      }
    };
    fetchActivity();
  }, [id]);

  // Display loading message if activity is not yet fetched
  if (!activity) return <Typography>Loading...</Typography>;

  // Handles upvotes and downvotes
  const handleVote = async (type, e) => {
    e.stopPropagation(); // Prevent the card click from being triggered
    try {
      const activityRef = doc(db, "activities", id);
      const activitySnap = await getDoc(activityRef);
      if (activitySnap.exists()) {
        const data = activitySnap.data();
        // Replace with your logic to get the current user's ID
        const userId = data.userID;
        let updateData = {};
        
        // Handling UPVOTE
        if (type === "upvotes") {
          if (hasUpvoted) {
            updateData = {
              upvotes: increment(-1),
              upvotedBy: arrayRemove(userId),
            };
            setHasUpvoted(false);
            setUpvotes((prev) => prev - 1);
          } else {
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

          // Handling DOWNVOTE
        } else if (type === "downvotes") {
          if (hasDownvoted) {
            updateData = {
              downvotes: increment(-1),
              downvotedBy: arrayRemove(userId),
            };
            setHasDownvoted(false);
            setDownvotes((prev) => prev - 1);
          } else {
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
        // Update Firestore with new vote counts and user voting state
        await updateDoc(activityRef, updateData);
      }
    } catch (error) {
      console.error("Error updating votes:", error);
    }
  };

  const images = activity.imageUrls || ["/placeholder.jpg"];

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Back Button: Allows user to return to the previous page */}
      <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>
        Back
      </Button>

      {/* Main Activity Card: Contains all activity details */}
      <Card sx={{ borderRadius: "12px", boxShadow: 3, position: "relative" }}>

        {/* Activity Image */}
        <CardMedia
          component="img"
          height="300"
          image={activity.imageUrls?.[0] || "/placeholder.jpg"}
          alt="Activity Image"
          sx={{ objectFit: "cover" }}
        />
        <CardContent>
          {/* Activity Title */}
          <Typography variant="h4" fontWeight="bold">
            {activity.placeName}
          </Typography>

          {/* Location Details + Google Maps Link */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body1" color="textSecondary">
              {activity.location?.city}, {activity.location?.state}
            </Typography>
            <IconButton
              color="primary"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${activity.location?.lat},${activity.location?.lng}`,
                  "_blank",
                )
              }
              sx={{ ml: 0.5 }}
            >
              <Room fontSize="small" />
            </IconButton>
          </Box>

          {/* University Associated with the Activity (If available) */}
          {activity.selectedUniversity && (
            <Typography variant="body2" color="textSecondary">
              <strong>College: </strong>
              {activity.selectedUniversity}
            </Typography>
          )}

          {/* Activity Description */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            {activity.description}
          </Typography>

          {/* Rating of the Activity */}
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
            {activity.rating} / 5
          </Typography>

          {/* Date when Activity was Created */}
          <Typography variant="caption" color="textSecondary">
            {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
          </Typography>

          {/* Tags Section: Displays all relevant tags */}
          {activity.tags?.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {activity.tags.map((tag, index) => (
                <Chip key={index} label={tag} color="primary" size="small" />
              ))}
            </Box>
          )}

          {/* Voting Section: Upvote / Downvote Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              startIcon={<ThumbUp />}
              sx={{ color: hasUpvoted ? "green" : "default" }}
              onClick={(e) => handleVote("upvotes", e)}
            >
              {upvotes}
            </Button>
            <Button
              startIcon={<ThumbDown />}
              sx={{ color: hasDownvoted ? "red" : "default" }}
              onClick={(e) => handleVote("downvotes", e)}
            >
              {downvotes}
            </Button>
          </Box>

          {/* Comments Section */}
          <CommentsSection activityId={id} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ActivityDetail;
