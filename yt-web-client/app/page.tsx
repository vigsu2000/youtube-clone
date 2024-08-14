import Image from 'next/image';
import Link from 'next/link';
import { getVideos } from './firebase/functions';
import styles from './page.module.css'


export default async function Home() {
  const videos = await getVideos();

  return (
    <main className={styles.videoList}>
      {videos.map((video) => (
        <div key={video.id} className={styles.videoContainer}>
          <Link href={`/watch?v=${video.filename}`}>
            <Image src={(video.thumbnailUrl != undefined) ? video.thumbnailUrl : '/thumbnail.png'} alt='video' width={120} height={80} className={styles.thumbnail} />
          </Link>
          {video.title && <p className={styles.title}>{video.title}</p>}
        </div>
      ))}
    </main>
  );
}

export const revalidate = 30;
