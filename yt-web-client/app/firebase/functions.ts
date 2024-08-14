import { httpsCallable } from 'firebase/functions';
import {functions} from './firebase';

const generateThumbnailUrlFunction = httpsCallable<{file: File}, {url: string, filename: string}>(functions, "generateThumbnailUrl");
const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");

export async function uploadVideo(videoFile: File, thumbnailFile: File, videoTitle: string) {
  let thumbnailUrl = '';
  let thumbnailFilename = '';
  let uploadThumbnailResult = null;
  const thumbnailUrlResponse = await generateThumbnailUrlFunction();
  thumbnailUrl = thumbnailUrlResponse?.data?.url;
  thumbnailFilename = thumbnailUrlResponse?.data?.filename;

  uploadThumbnailResult = await fetch(thumbnailUrlResponse?.data?.url, {
    method: 'PUT',
    body: thumbnailFile,
    headers: {
      'Content-Type': thumbnailFile.type,
    },
  });
  
  const response: any = await generateUploadUrlFunction({
    fileExtension: videoFile.name.split('.').pop(),
    title: videoTitle,
    thumbnailName: thumbnailFilename
  });

  // Upload the file to the signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: 'PUT',
    body: videoFile,
    headers: {
      'Content-Type': videoFile.type,
    },
  });

  return uploadResult;
}

const getVideosFunction = httpsCallable(functions, "getVideos");

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: string,
  title?: string,
  description?: string,
  thumbnailUrl?: string,
}

export async function getVideos() {
  const response: any = await getVideosFunction();
  return response.data as Video[];
}