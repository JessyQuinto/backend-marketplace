"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const firebase_admin_1 = require("firebase-admin");
// Import the service account key from the JSON file
const serviceAccountKey_json_1 = __importDefault(require("./serviceAccountKey.json"));
let db = null;
exports.db = db;
let auth = null;
exports.auth = auth;
// Initialize Firebase Admin SDK using the local service account key
if (!(0, app_1.getApps)().length) {
    console.log('Initializing Firebase Admin SDK with local service account key...');
    (0, app_1.initializeApp)({
        // Use credential.cert with the imported service account
        credential: firebase_admin_1.credential.cert(serviceAccountKey_json_1.default),
        // Optionally, you can specify the database URL if it's not detected automatically
        // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    exports.db = db = (0, firestore_1.getFirestore)();
    exports.auth = auth = (0, auth_1.getAuth)();
    console.log('Firebase Admin SDK initialized successfully.');
}
else {
    // This case might happen in environments with hot-reloading
    console.log('Firebase Admin SDK already initialized.');
    exports.db = db = (0, firestore_1.getFirestore)();
    exports.auth = auth = (0, auth_1.getAuth)();
}
//# sourceMappingURL=firebase.js.map