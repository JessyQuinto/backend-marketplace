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
    const serviceAccountPath = path.join(__dirname, 'chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
    
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Using local service account key: chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
        const serviceAccount = require('./chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
        initializeApp({
            credential: credential.cert(serviceAccount),
        });
    } else {
        console.log('No service account key found. Using chocomarketlogin project...');
        // Use the same project as the frontend
        initializeApp({
            projectId: 'chocomarketlogin' // Same project as frontend
        });
    }
    db = getFirestore();
    auth = getAuth();
    console.log('Firebase Admin SDK initialized successfully with project: chocomarketlogin');
    
    // Test Firestore connection
    console.log('🔍 Testing Firestore connection...');
    db.collection('test').doc('connection-test').get()
        .then(() => {
            console.log('✅ Firestore connection successful!');
        })
        .catch((error) => {
            console.error('❌ Firestore connection failed:', error);
        });
} else {
     // This case might happen in environments with hot-reloading
    console.log('Firebase Admin SDK already initialized.');
    db = getFirestore();
    auth = getAuth();
}


export { db, auth };
