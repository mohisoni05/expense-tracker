import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const forgotPasswordLink = document.getElementById('forgotPassword');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorContainer = document.getElementById('errorContainer');

// Show/Hide loading indicator
const showLoading = () => loadingIndicator.style.display = 'flex';
const hideLoading = () => loadingIndicator.style.display = 'none';

// Show error message
const showError = (message) => {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
};

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    } else {
        // Show login form by default or signup based on URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (mode === 'signup') {
            showSignupForm();
        } else {
            showLoginForm();
        }
    }
});

// Show Login Form
function showLoginForm() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
}

// Show Signup Form
function showSignupForm() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Signup Form Submit
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Forgot Password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        showError('Please enter your email address');
        return;
    }

    showLoading();
    try {
        await sendPasswordResetEmail(auth, email);
        showError('Password reset email sent! Check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Switch between login and signup forms
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
}); 