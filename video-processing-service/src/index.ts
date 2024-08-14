import express from 'express';

import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo,
  setupDirectories
} from './storage';
import { isVideoNew, setVideo } from './firestore';

// Create the local directories for videos
setupDirectories();

const app = express();
app.use(express.json());

// Process a video file from Cloud Storage
app.post('/process-video', async (req, res) => {

  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send('Bad Request: missing filename');
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.substring(0, inputFileName.lastIndexOf('.'));
  const params = videoId.split('-field-');
  const videoTitle = params[0];
  const thumbnailFilename = params[1];

  if (!isVideoNew(videoId)) {
    return res.status(400).send('Bad Requst: video already processing or processed.');
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split('-')[0],
      status: 'processing',
      title: videoTitle,
      thumbnailUrl: `https://storage.googleapis.com/vigsu2000-thumbnails/${thumbnailFilename}`
    });
  }

  // Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);

  //Process the video
  try {
    await convertVideo(inputFileName, outputFileName)
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);
    return res.status(500).send('Processing failed');
  }

  // Upload the processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  await setVideo(videoId, {
    status: 'processed',
    filename: outputFileName
  });

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ]);

  return res.status(200).send('Processing finished successfully');
  
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
