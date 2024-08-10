import { signInWithGoogle, signOut } from '../firebase/firebase';
import styles from './sign-in.module.css';
import { User } from 'firebase/auth';
import Image from 'next/image';

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  const userPhotoUrl = user ? user.photoURL : null;
  const userEmail = user ? user.email : '';

  return (
    <div>
      {user ? (
        // If user is signed in, show a welcome message (or something else)
        <div className={styles.container}>
          {userPhotoUrl ? (
            <div className={styles.imageWrapper}>
              <Image
                className={styles.profileImage}
                src={userPhotoUrl}
                alt="Profile pic"
                width={50} // Provide width
                height={50} // Provide height
              />
              <div className={styles.tooltip}>
                {userEmail}
              </div>
            </div>
          ) : (
            <p>No profile picture</p> // Optional: Show a placeholder or message if no photo URL is available
          )}
          <button className={styles.signin} onClick={signOut}>
            Sign Out
          </button>
        </div>
      ) : (
        // If user is not signed in, show sign-in button
        <button className={styles.signin} onClick={signInWithGoogle}>
          Sign in
        </button>
      )}
    </div>
  );
}
