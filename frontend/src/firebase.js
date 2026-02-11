import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

let appCheck;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);



// Initialize App Check
if (import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY) {

    // Enable Debug Token locally to avoid reCAPTCHA issues
    // Enable Debug Token locally to avoid reCAPTCHA issues
    if (import.meta.env.DEV) {
        // Using a FIXED token so you can easily register it without searching logs
        const debugToken = "d1dee79a-ce97-437b-8e99-c708672eb762";
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
        console.log("USING FIXED DEBUG TOKEN:", debugToken);
    }


    console.log('Using App Check Site Key:', import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY);
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: true
    });
    console.log('Firebase App Check initialized.');
} else {
    console.warn('Firebase App Check Site Key not found. App Check not initialized.');
}

export { app, appCheck };
export default app;
