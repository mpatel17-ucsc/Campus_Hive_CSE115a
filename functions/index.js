const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables from .env file (only needed for local development)
dotenv.config();

// Initialize Firebase
initializeApp();

// Set global options for V2 functions
setGlobalOptions({
  region: "us-central1",
  timeoutSeconds: 60,
});

// Get environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Create the OAuth2 client
function getOAuth2Client() {
  const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL,
  );

  OAuth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return OAuth2Client;
}

async function sendEmails(activityZip, activityTitle) {
  const db = getFirestore();

  // Get users with notifications allowed and matching ZIP
  const usersSnapshot = await db
    .collection("users")
    .where("notiSettings.allow", "==", true)
    .where("notiSettings.zip", "==", activityZip)
    .get();

  if (usersSnapshot.empty) {
    console.log(
      `No users found with notifications enabled in ZIP: ${activityZip}`,
    );
    return;
  }

  const OAuth2Client = getOAuth2Client();
  const accessToken = await OAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "rivaidun@ucsc.edu",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const emailPromises = usersSnapshot.docs.map(async (doc) => {
    const userData = doc.data();
    console.log("data", userData);
    if (userData.email) {
      try {
        await transporter.sendMail({
          from: "rivaidun@ucsc.edu",
          to: userData.email,
          subject: "New activity alert in your area!",
          text: `Hey there! A new activity was just posted, ${activityTitle}, in the area (${activityZip}). Check out Campus Hive for more details!`,
        });
        console.log(`Email sent successfully to ${userData.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${userData.email}:`, error);
      }
    }
  });

  await Promise.all(emailPromises);
  console.log(`All emails sent to users in ZIP ${activityZip}`);
}

// async function sendTest(activityZip) {
//   console.log("zip, ", activityZip);
//   const OAuth2Client = getOAuth2Client();
//   const accessToken = await OAuth2Client.getAccessToken();
//
//   // const transporter = nodemailer.createTransport({
//   //   service: "gmail",
//   //   auth: {
//   //     type: "OAuth2",
//   //     user: "rivaidun@ucsc.edu",
//   //     clientId: CLIENT_ID,
//   //     clientSecret: CLIENT_SECRET,
//   //     refreshToken: REFRESH_TOKEN,
//   //     accessToken: accessToken.token,
//   //   },
//   // });
//   //
//   // const emailPromises = usersSnapshot.docs.map(async (doc) => {
//   //   const userData = doc.data();
//   //   if (userData.email) {
//   //     try {
//   //       await transporter.sendMail({
//   //         from: "rivaidun@ucsc.edu",
//   //         to: "rithwik.vaidun@gmail.com",
//   //         subject: "New activity alert in your area!",
//   //         text: `Hey there! A new activity was just posted in your area (${activityZip}). Check out Campus Hive for more details!`,
//   //       });
//   //       // console.log(`Email sent successfully to ${userData.email}`);
//   //       console.log(`Email sent successfully to rithwik.vaidun@gmail.com`);
//   //     } catch (error) {
//   //       // console.error(`Failed to send email to ${userData.email}:`, error);
//   //       console.error(
//   //         `Failed to send email to rithwik.vaidun@gmail.com:`,
//   //         error,
//   //       );
//   //     }
//   //   }
//   // });
//
//   // await Promise.all(emailPromises);
//   console.log(`All emails sent to users in ZIP ${activityZip}`);
// }

// Triggered when a new activity is created
// exports.sendEmailOnActCreate = onDocumentUpdated(

exports.sendEmailOnActCreate = onDocumentCreated(
  "activities/{activityId}",
  async (event) => {
    try {
      if (!event.data) {
        console.log("No data associated with the event");
        return null;
      }

      const activityData = event.data.data();

      if (
        !activityData ||
        !activityData.location ||
        !activityData.location.zip
      ) {
        console.log(
          "No ZIP code found in the activity, skipping email notifications.",
        );
        return null;
      }

      const zip = activityData.location.zip;
      console.log(`New activity created in ZIP: ${zip}`);

      await sendEmails(zip, activityData.placeName);
      return null;
    } catch (error) {
      console.error("Error in function execution:", error);
      throw error;
    }
  },
);

//exports.test = onDocumentUpdated(
//  "activities/{activityId}",
//
//  async (event) => {
//    await sendTest(95060);
//  },
//);
