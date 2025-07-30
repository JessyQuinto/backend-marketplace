"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const firebase_admin_1 = require("firebase-admin");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let db = null;
exports.db = db;
let auth = null;
exports.auth = auth;
// Initialize Firebase Admin SDK
if (!(0, app_1.getApps)().length) {
    console.log('Initializing Firebase Admin SDK...');
    // Try to load service account key
    const serviceAccountPath = path.join(__dirname, 'chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Using local service account key: chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
        const serviceAccount = require('./chocomarketlogin-firebase-adminsdk-fbsvc-e22dcdc42f.json');
        (0, app_1.initializeApp)({
            credential: firebase_admin_1.credential.cert(serviceAccount),
        });
    }
    else {
        console.log('No service account key found. Using chocomarketlogin project...');
        // Use the same project as the frontend
        (0, app_1.initializeApp)({
            projectId: 'chocomarketlogin' // Same project as frontend
        });
    }
    exports.db = db = (0, firestore_1.getFirestore)();
    exports.auth = auth = (0, auth_1.getAuth)();
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
}
else {
    // This case might happen in environments with hot-reloading
    console.log('Firebase Admin SDK already initialized.');
    exports.db = db = (0, firestore_1.getFirestore)();
    exports.auth = auth = (0, auth_1.getAuth)();
}
//# sourceMappingURL=firebase.js.map