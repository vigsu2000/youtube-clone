'use client';

import React, { useState } from 'react';
import { Fragment } from "react";
import { uploadVideo } from "../firebase/functions";

import styles from "./upload.module.css";

export default function Upload() {

  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0) || null;
    setFile(selectedFile);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("add a video file");
      return;
    } 
    if (!text) {
      alert("add a video title");
      return;
    }
    try {
      const response = await uploadVideo(file, text);
      alert(`File uploaded successfully. Server responded with: ${JSON.stringify(response)}`);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  };

  return (
    <Fragment>
      <div className={styles.container}>
        <input
          id="upload"
          className={styles.uploadInput}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="Enter description..."
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
