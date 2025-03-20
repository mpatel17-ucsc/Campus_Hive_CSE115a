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
  const { id } = useParams();
  const [activity, setActivity] = useState(null);

  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        setActivity(data);
        setUpvotes(data.upvotes || 0);
        setDownvotes(data.downvotes || 0);
        setHasUpvoted(data.upvotedBy?.includes(data.userID));
        setHasDownvoted(data.downvotedBy?.includes(data.userID));
      }
    };
    fetchActivity();
  }, [id]);

  if (!activity) return <Typography>Loading...</Typography>;

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
      <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>
        Back
      </Button>
      <Card sx={{ borderRadius: "12px", boxShadow: 3, position: "relative" }}>
        
        {/* Image Carousel */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="300"
            image={images[currentImageIndex]}
            alt="Activity Image"
            sx={{ objectFit: "cover" }}
          />
          
          {/* Left Arrow */}
          {images.length > 1 && (
            <IconButton
              sx={{ position: "absolute", top: "50%", left: 10, transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "white" }}
              onClick={handlePrevImage}
            >
              <ArrowBackIos />
            </IconButton>
          )}
          
          {/* Right Arrow */}
          {images.length > 1 && (
            <IconButton
              sx={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "white" }}
              onClick={handleNextImage}
            >
              <ArrowForward />
            </IconButton>
          )}
          
          {/* Dot Navigation */}
          {images.length > 1 && (
            <Box sx={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1 }}>
              {images.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: index === currentImageIndex ? "white" : "gray",
                    opacity: index === currentImageIndex ? 1 : 0.5
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <CardContent>
          <Typography variant="h4" fontWeight="bold">
            {activity.placeName}
          </Typography>
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
          {activity.selectedUniversity && (
            <Typography variant="body2" color="textSecondary">
              <strong>College: </strong>
              {activity.selectedUniversity}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 2 }}>
            {activity.description}
          </Typography>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
            ⭐ {activity.rating} / 5
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}
          </Typography>
          {activity.tags?.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {activity.tags.map((tag, index) => (
                <Chip key={index} label={tag} color="primary" size="small" />
              ))}
            </Box>
          )}
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
          <CommentsSection activityId={id} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ActivityDetail;
