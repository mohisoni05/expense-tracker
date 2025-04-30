import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Get DOM elements
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordConfirmGroup = document.getElementById('passwordConfirmGroup');
const submitButton = document.getElementById('submitButton');
const toggleAuthLink = document.getElementById('toggleAuth');
const forgotPasswordLink = document.getElementById('forgotPassword');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const errorMessage = document.getElementById('errorMessage');

// Get mode from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let isLoginMode = urlParams.get('mode') !== 'signup';

// Update UI based on mode
function updateAuthUI(isLogin) {
    authTitle.textContent = isLogin ? 'Sign In to SmartTrack' : 'Create an Account';
    authSubtitle.textContent = isLogin 
        ? 'Welcome back! Please enter your details.'
        : 'Get started with SmartTrack today.';
    submitButton.textContent = isLogin ? 'Sign In' : 'Sign Up';
    toggleAuthLink.textContent = isLogin 
        ? "Don't have an account? Sign up"
        : 'Already have an account? Sign in';
    passwordConfirmGroup.style.display = isLogin ? 'none' : 'block';
    errorMessage.textContent = '';
}

// Initialize UI
updateAuthUI(isLoginMode);

// Toggle between login and signup
toggleAuthLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    updateAuthUI(isLoginMode);
});

// Handle forgot password
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        errorMessage.textContent = 'Please enter your email address.';
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        errorMessage.textContent = 'Password reset email sent. Please check your inbox.';
        errorMessage.style.color = '#059669'; // Success color
    } catch (error) {
        errorMessage.textContent = 'Error sending reset email. Please try again.';
        errorMessage.style.color = '#dc2626'; // Error color
    }
});

// Handle form submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    if (!isLoginMode) {
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }
    }

    try {
        let userCredential;
        
        if (isLoginMode) {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: email,
                createdAt: new Date().toISOString(),
                settings: {
                    currency: 'USD',
                    monthlyBudget: 0
                }
            });
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Auth error:', error);
        errorMessage.textContent = error.message;
    }
}); 