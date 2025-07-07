// script.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXS0Mr9A9EgNHAr7tmtAkS0b2JyVdaHXc",
  authDomain: "stria-chat.firebaseapp.com",
  projectId: "stria-chat",
  storageBucket: "stria-chat.firebasestorage.app",
  messagingSenderId: "742772667117",
  appId: "1:742772667117:web:d748e7f308e272073512e4",
  measurementId: "G-3DX8081MT7"
};

// Initial authentication token (provided by the environment if available)
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// App ID (provided by the environment if available, otherwise a default)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore, though not used in this initial version

// Get UI elements
const signinScreen = document.getElementById('signin-screen');
const homeScreen = document.getElementById('home-screen');
const googleSigninButton = document.getElementById('google-signin-button');
const signoutButton = document.getElementById('signout-button');
const loadingOverlay = document.getElementById('loading-overlay');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageCloseButton = document.getElementById('message-close-button');
const userDp = document.getElementById('user-dp');
const userIdDisplay = document.getElementById('user-id-display');
const uploadDpButton = document.getElementById('upload-dp-button');
const dpFileInput = document.getElementById('dp-file-input');

// Function to show loading overlay
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

// Function to hide loading overlay
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Function to show custom message box
function showMessage(message) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
}

// Function to hide custom message box
messageCloseButton.addEventListener('click', () => {
    messageBox.classList.add('hidden');
});

// Authenticate with custom token or anonymously if token is not available
async function authenticateUser() {
    showLoading();
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Signed in with custom token.");
        } else {
            await signInAnonymously(auth);
            console.log("Signed in anonymously.");
        }
    } catch (error) {
        console.error("Authentication error:", error);
        showMessage(`Authentication error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Google Sign-in
googleSigninButton.addEventListener('click', async () => {
    console.log("Google Sign-in button clicked."); // Added log
    showLoading();
    const provider = new GoogleAuthProvider();
    try {
        console.log("Attempting to sign in with Google popup..."); // Added log
        await signInWithPopup(auth, provider);
        console.log("Signed in with Google!");
    } catch (error) {
        console.error("Google Sign-in error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Sign-in popup closed by user.");
            showMessage("Sign-in was cancelled. Please try again."); // User-friendly message
        } else {
            showMessage(`Error during Google Sign-in: ${error.message}`);
        }
    } finally {
        hideLoading();
    }
});

// Sign-out
signoutButton.addEventListener('click', async () => {
    showLoading();
    try {
        await signOut(auth);
        console.log("Signed out successfully!");
    } catch (error) {
        console.error("Sign-out error:", error);
        showMessage(`Error during sign-out: ${error.message}`);
    } finally {
        hideLoading();
    }
});

// Handle DP upload button click
uploadDpButton.addEventListener('click', () => {
    dpFileInput.click(); // Trigger the hidden file input
});

// Handle file input change (when a file is selected)
dpFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log("Selected file for DP:", file.name, file.type, file.size, "bytes");
        showMessage(`Attempting to upload: ${file.name}. In a real app, this would send to a backend for Internet Archive storage.`);

        // Simulate file reading and display
        const reader = new FileReader();
        reader.onload = (e) => {
            userDp.src = e.target.result; // Display the selected image
        };
        reader.readAsDataURL(file);

        // --- Conceptual Internet Archive Upload (Backend Required) ---
        // This is where you would typically send the file to your backend server.
        // The backend server would then securely use your Internet Archive AccessKey:SecretKey
        // to upload the file to the Internet Archive's S3-compatible storage.
        // Example (conceptual, not runnable client-side):
        /*
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', auth.currentUser.uid); // Send user ID for organization

        fetch('/upload-to-internet-archive', { // Your backend endpoint
            method: 'POST',
            body: formData,
            // Headers like 'Authorization' would be handled by your backend
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('DP uploaded successfully to Internet Archive (simulated):', data.url);
                // Update userDp.src with the actual URL from Internet Archive if successful
                // userDp.src = data.url;
                showMessage('Display Picture uploaded successfully (simulated)!');
            } else {
                console.error('DP upload failed (simulated):', data.error);
                showMessage('Failed to upload Display Picture (simulated).');
            }
        })
        .catch(error => {
            console.error('Network or backend error during DP upload (simulated):', error);
            showMessage('An error occurred during upload (simulated).');
        });
        */
        // -----------------------------------------------------------

    } else {
        console.log("No file selected.");
    }
});

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);
        signinScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        const userId = auth.currentUser?.uid || crypto.randomUUID(); // Ensure userId is always available
        userIdDisplay.textContent = `ID: ${userId}`; // Display full user ID
        console.log("Current User ID:", userId);

        // In a real app, you would fetch the user's DP URL from your database
        // (e.g., Firestore where you store user profiles) and set userDp.src
        // For now, it remains the placeholder or the locally selected image.
    } else {
        // User is signed out
        console.log("User is signed out.");
        signinScreen.classList.remove('hidden');
        homeScreen.classList.add('hidden');
        userIdDisplay.textContent = ''; // Clear user ID
        userDp.src = "https://placehold.co/60x60/333333/FFFFFF?text=DP"; // Reset DP
    }
    hideLoading(); // Hide loading after auth state is determined
});

// Call authenticateUser on page load to handle initial token or anonymous sign-in
authenticateUser();
