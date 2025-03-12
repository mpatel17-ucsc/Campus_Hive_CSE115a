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
import { ThumbUp, ThumbDown, Room, ArrowBack } from "@mui/icons-material";
import { db, auth } from "../util/firebase";
import { doc, getDoc, increment, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import CommentsSection from "../components/CommentSection";

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);

  const user = auth.currentUser; 

  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);


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
        const userId = data.userID // Replace with your logic to get the current user's ID
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>Back</Button>
      <Card sx={{ borderRadius: "12px", boxShadow: 3, position: "relative" }}>
        <CardMedia component="img" height="300" image={activity.imageUrls?.[0] || "/placeholder.jpg"} alt="Activity Image" sx={{ objectFit: "cover" }} />
        <CardContent>
          <Typography variant="h4" fontWeight="bold">{activity.locationName}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body1" color="textSecondary">{activity.location?.city}, {activity.location?.state}</Typography>
            <IconButton color="primary" onClick={() => window.open(`https://www.google.com/maps?q=${activity.location?.lat},${activity.location?.lng}`, "_blank")} sx={{ ml: 0.5 }}>
              <Room fontSize="small" />
            </IconButton>
          </Box>
          {activity.selectedUniversity && <Typography variant="body2" color="textSecondary"><strong>College: </strong>{activity.selectedUniversity}</Typography>}
          <Typography variant="body1" sx={{ mt: 2 }}>{activity.description}</Typography>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>⭐ {activity.rating} / 5</Typography>
          <Typography variant="caption" color="textSecondary">{new Date(activity.createdAt?.seconds * 1000).toLocaleDateString()}</Typography>
          {activity.tags?.length > 0 && (
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {activity.tags.map((tag, index) => <Chip key={index} label={tag} color="primary" size="small" />)}
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button startIcon={<ThumbUp />} sx={{ color:  hasUpvoted ? "green" : "default" }} onClick={(e) => handleVote("upvotes", e)}>{upvotes}</Button>
            <Button startIcon={<ThumbDown />} sx={{ color:  hasDownvoted ? "red" : "default" }} onClick={(e) => handleVote("downvotes", e)}>{downvotes}</Button>
          </Box>
          <CommentsSection activityId={id} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ActivityDetail;
