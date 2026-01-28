// ========================================
// 🔥 НОВЫЙ FIREBASE CONFIG - МОДУЛЬНЫЙ ПОДХОД
// ========================================
// Используй этот файл вместо дублирования кода в каждом HTML

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyB3Tf0kqjLPinrVrcxzB_0Niy3RIL9FJ5Q",
    authDomain: "kushti-anime.firebaseapp.com",
    projectId: "kushti-anime",
    storageBucket: "kushti-anime.firebasestorage.app",
    messagingSenderId: "539636802828",
    appId: "1:539636802828:web:9d6d7877d88ac452d61529",
    measurementId: "G-7ZTFL5TVCS"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Экспорт
export { app, auth, db };
