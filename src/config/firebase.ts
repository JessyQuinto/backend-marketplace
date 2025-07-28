import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

let db: Firestore | null = null;
let auth: Auth | null = null;

// Initialize Firebase Admin SDK
if (!getApps().length) {
    console.log('Initializing Firebase Admin SDK...');
    
    // Try to load service account key
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Using local service account key...');
        const serviceAccount = require('./serviceAccountKey.json');
        initializeApp({
            credential: credential.cert(serviceAccount),
        });
    } else {
        console.log('No service account key found. Using default project for development...');
        // For development, use the Firebase emulator or a test project
        initializeApp({
            projectId: 'demo-marketplace-project' // Demo project ID
        });
    }
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
