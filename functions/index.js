const functions = require("firebase-functions");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const {
  onDocumentUpdated,
  onDocumentCreated,
} = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({ region: "us-central1", timeoutSeconds: 60 });

// Read from Firebase config (this works both locally & in production)
const config =
  functions.config().oauth || require("./.runtimeconfig.json").oauth;

const OAuth2Client = new google.auth.OAuth2(
  config.client_id,
  config.client_secret,
  config.redirect_url,
);

OAuth2Client.setCredentials({
  refresh_token: config.refresh_token,
});

async function sendEmails() {
  const db = getFirestore();
  const usersSnapshot = await db
    .collection("users")
    .where("allowNotifications", "==", true)
    .get();

  if (usersSnapshot.empty) {
    console.log("No users with notifications enabled.");
    return;
  }

  const accessToken = await OAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "rivaidun@ucsc.edu",
      clientId: config.client_id,
      clientSecret: config.client_secret,
      refreshToken: config.refresh_token,
      accessToken: accessToken.token,
    },
  });

  const emailPromises = usersSnapshot.docs.map(async (doc) => {
    const userData = doc.data();
    if (userData.email) {
      try {
        await transporter.sendMail({
          from: "rivaidun@ucsc.edu",
          to: userData.email,
          subject: "New activity alert",
          text: "Checkout Campus Hive to view the latest new and fun activities!",
        });
        console.log(`Email sent successfully to ${userData.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${userData.email}:`, error);
      }
    }
  });

  await Promise.all(emailPromises);
  console.log("All emails processed.");
}
exports.sendEmailOnUserUpdate = onDocumentCreated(
  "activities/{userId}",
  (event) => {
    console.log("tets");
    sendEmails();
    return null;
  },
);
