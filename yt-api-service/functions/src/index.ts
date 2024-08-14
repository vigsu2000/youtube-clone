import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

admin.initializeApp();

const firestore = admin.firestore();

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
});

const storage = new Storage();
const rawVideoBucketName = "raw-videos";
const thumbnailBucketName = "vigsu2000-thumbnails";

export const generateThumbnailUrl = onCall({maxInstances: 1}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const bucket = storage.bucket(thumbnailBucketName);

  // create a unique filename
  const filename = `${auth.uid}-${Date.now()}.jpg`;

  // get a signed URL to upload to the bucket
  const [url] = await bucket.file(filename).getSignedUrl({
    version: "v4", // Use v4 signing method
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration
    contentType: "image/jpeg", // Set the content type to the expected MIME type
  });

  // return the signed URL and filename
  return {url, filename};
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // Generate a unique filename for upload
  const fileName =
    `${data.title}-field-${data.thumbnailName}.${data.fileExtension}`;

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
  });

  return {url, fileName};
});

const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string,
  thumbnailUrl?: string,
}

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
  return querySnapshot.docs.map((doc) => doc.data());
});

