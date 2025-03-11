const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const functions = require("firebase-functions-test")();
const sinon = require("sinon");
const nodemailer = require("nodemailer");
const { expect } = require("chai");

// Initialize Firebase (using emulator)
initializeApp();
const db = getFirestore();

// Import the function to test
const myFunctions = require("../index"); // Path to your function file

describe("sendEmailOnUserUpdate Function Tests", function () {
  this.timeout(10000); // Increase timeout for Firebase operations

  // Mock data
  const testZip = "95064"; // Example ZIP code
  const testUsers = [
    {
      id: "user1",
      email: "user1@example.com",
      notiSettings: { allow: true, zip: "95064" },
    },
    {
      id: "user2",
      email: "user2@example.com",
      notiSettings: { allow: true, zip: "95064" },
    },
    {
      id: "user3",
      email: "user3@example.com",
      notiSettings: { allow: true, zip: "90210" },
    }, // Different ZIP
    {
      id: "user4",
      email: "user4@example.com",
      notiSettings: { allow: false, zip: "95064" },
    }, // Notifications disabled
    {
      id: "user5",
      email: "user5@example.com",
      notiSettings: { allow: true, zip: "" },
    }, // Empty ZIP
    { id: "user6", id: "user6", notiSettings: { allow: true, zip: "95064" } }, // No email field
  ];
  const validActivity = {
    id: "activity1",
    title: "Test Activity",
    description: "Test Description",
    location: { zip: testZip, address: "123 Test St" },
  };
  const noZipActivity = {
    id: "activity2",
    title: "No ZIP Activity",
    description: "Missing ZIP",
    location: { address: "123 Test St" },
  };
  const noLocationActivity = {
    id: "activity3",
    title: "No Location Activity",
    description: "Missing location field",
  };

  let sendMailStub;
  let consoleSpy;

  before(async function () {
    // Create test users
    const batch = db.batch();
    for (const user of testUsers) {
      const userRef = db.collection("users").doc(user.id);
      batch.set(userRef, user);
    }
    await batch.commit();

    // Mock nodemailer's sendMail function
    sendMailStub = sinon.stub().resolves({ response: "Email sent" });
    sinon
      .stub(nodemailer, "createTransport")
      .returns({ sendMail: sendMailStub });

    // Spy on console logs
    consoleSpy = sinon.spy(console, "log");

    // Mock OAuth client
    sinon.stub(require("googleapis").google.auth, "OAuth2").returns({
      setCredentials: sinon.stub(),
      getAccessToken: sinon.stub().resolves({ token: "fake-token" }),
    });
  });

  after(async function () {
    // Clean up test data
    const batch = db.batch();

    // Delete test users
    for (const user of testUsers) {
      const userRef = db.collection("users").doc(user.id);
      batch.delete(userRef);
    }

    // Delete test activities
    const activityRefs = [
      db.collection("activities").doc(validActivity.id),
      db.collection("activities").doc(noZipActivity.id),
      db.collection("activities").doc(noLocationActivity.id),
    ];
    activityRefs.forEach((ref) => batch.delete(ref));

    await batch.commit();

    // Restore stubs and spies
    sinon.restore();

    // Clean up Firebase test context
    functions.cleanup();
  });

  beforeEach(function () {
    // Reset stubs for each test
    sendMailStub.resetHistory();
    consoleSpy.resetHistory();
  });

  it("should send emails to users with matching ZIP when activity has a ZIP code", async function () {
    // Create the wrapped function
    const wrapped = functions.wrap(myFunctions.sendEmailOnUserUpdate);

    // Create test data and snapshots
    const activitySnap = functions.firestore.makeDocumentSnapshot(
      validActivity,
      `activities/${validActivity.id}`,
    );
    const activityChange = functions.makeChange(null, activitySnap);

    // Call the function
    await wrapped(activityChange);

    // Check if the function called sendMail for the correct users
    expect(sendMailStub.callCount).to.equal(2); // Only 2 users match zip and have notifications enabled
    expect(sendMailStub.firstCall.args[0].to).to.equal("user1@example.com");
    expect(sendMailStub.secondCall.args[0].to).to.equal("user2@example.com");
    expect(consoleSpy.calledWith(`New activity created in ZIP: ${testZip}`)).to
      .be.true;
  });

  it("should not send emails when activity has no ZIP code", async function () {
    const wrapped = functions.wrap(myFunctions.sendEmailOnUserUpdate);

    const activitySnap = functions.firestore.makeDocumentSnapshot(
      noZipActivity,
      `activities/${noZipActivity.id}`,
    );
    const activityChange = functions.makeChange(null, activitySnap);

    await wrapped(activityChange);

    expect(sendMailStub.callCount).to.equal(0);
    expect(
      consoleSpy.calledWith(
        "No ZIP code found in the activity, skipping email notifications.",
      ),
    ).to.be.true;
  });

  it("should not send emails when activity has no location field", async function () {
    const wrapped = functions.wrap(myFunctions.sendEmailOnUserUpdate);

    const activitySnap = functions.firestore.makeDocumentSnapshot(
      noLocationActivity,
      `activities/${noLocationActivity.id}`,
    );
    const activityChange = functions.makeChange(null, activitySnap);

    await wrapped(activityChange);

    expect(sendMailStub.callCount).to.equal(0);
    expect(
      consoleSpy.calledWith(
        "No ZIP code found in the activity, skipping email notifications.",
      ),
    ).to.be.true;
  });

  it("should not send emails when no users match the ZIP code", async function () {
    const wrapped = functions.wrap(myFunctions.sendEmailOnUserUpdate);

    // Activity with a ZIP that no users have
    const uniqueZipActivity = {
      ...validActivity,
      id: "unique-zip-activity",
      location: { zip: "12345", address: "123 Test St" },
    };

    const activitySnap = functions.firestore.makeDocumentSnapshot(
      uniqueZipActivity,
      `activities/${uniqueZipActivity.id}`,
    );
    const activityChange = functions.makeChange(null, activitySnap);

    await wrapped(activityChange);

    expect(sendMailStub.callCount).to.equal(0);
    expect(
      consoleSpy.calledWith(
        "No users found with notifications enabled in ZIP: 12345",
      ),
    ).to.be.true;
  });

  it("should handle errors gracefully if email sending fails", async function () {
    // Make sendMail reject for this test
    sendMailStub.rejects(new Error("Email sending failed"));

    const wrapped = functions.wrap(myFunctions.sendEmailOnUserUpdate);
    const activitySnap = functions.firestore.makeDocumentSnapshot(
      validActivity,
      `activities/${validActivity.id}`,
    );
    const activityChange = functions.makeChange(null, activitySnap);

    // Function should complete without throwing, even though emails fail
    await wrapped(activityChange);

    // Should still attempt to send emails
    expect(sendMailStub.callCount).to.equal(2);
    // Check for error logs (using a spy on console.error would be better)
  });

  // Positive test: Manually create an activity and verify function execution
  it("should trigger when a new activity document is created", async function () {
    // This will actually create a document and trigger the function
    const newActivity = {
      title: "Real-time Test Activity",
      description: "This should trigger the function",
      location: { zip: testZip, address: "123 Trigger St" },
    };

    // Create the document
    await db.collection("activities").doc("trigger-test").set(newActivity);

    // Wait a bit for the function to be triggered
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // We can't easily test if the function was triggered in this test environment
    // Clean up
    await db.collection("activities").doc("trigger-test").delete();
  });
});
