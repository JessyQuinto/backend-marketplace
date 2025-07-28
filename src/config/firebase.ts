import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';

// Import the service account key from the JSON file
import serviceAccount from './serviceAccountKey.json';

let db: Firestore | null = null;
let auth: Auth | null = null;

// Initialize Firebase Admin SDK using the local service account key
if (!getApps().length) {
    console.log('Initializing Firebase Admin SDK with local service account key...');
    initializeApp({
        // Use credential.cert with the imported service account
        credential: credential.cert(serviceAccount as any),
        // Optionally, you can specify the database URL if it's not detected automatically
        // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    db = getFirestore();
    auth = getAuth();
    console.log('Firebase Admin SDK initialized successfully.');
} else {
     // This case might happen in environments with hot-reloading
    console.log('Firebase Admin SDK already initialized.');
    db = getFirestore();
    auth = getAuth();
}


export { db, auth };
