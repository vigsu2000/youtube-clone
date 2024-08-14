'use client';

import React, { useState } from 'react';
import { Fragment } from "react";
import { uploadVideo } from "../firebase/functions";

import styles from "./upload.module.css";

export default function Upload() {

  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0) || null;
    setVideo(selectedFile);
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0) || null;
    setThumbnail(selectedFile);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleUpload = async () => {
    if (!video) {
      alert("add a video file");
      return;
    } 
    if (!thumbnail) {
      alert("add a thumbnail");
      return;
    }
    if (!text) {
      alert("add a video title");
      return;
    }
    try {
      const response = await uploadVideo(video, thumbnail, text);
      alert(`File uploaded successfully. Server responded with: ${JSON.stringify(response)}`);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <Fragment>
      <div className={styles.container}>
        <input
          id="upload video"
          className={styles.uploadInput}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />
        <input
          id="upload thumbnail"
          className={styles.uploadInput}
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
        <input
          type="text"
          placeholder="Enter Title"
          className={styles.textInput}
          onChange={handleTextChange}
        />
        <button
          className={styles.uploadButton}
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>
    </Fragment>
  );
}
