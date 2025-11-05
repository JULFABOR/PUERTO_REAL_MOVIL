/**
 * @file firebaseConfig.js
 * @description Inicialización y configuración de los servicios de Firebase.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

/**
 * @description Objeto de configuración de Firebase.
 * @important **SEGURIDAD**: Es una mala práctica exponer las claves de API directamente en el código fuente.
 * En una aplicación de producción, estos valores deben cargarse desde variables de entorno seguras
 * (por ejemplo, usando un archivo .env y una librería como `react-native-dotenv`).
 */
const firebaseConfig = {
  apiKey: "AIzaSyAeb5Z1GrKNeMlG8E_buTmlpy3xzmKQDtA", // ¡No subir a repositorios públicos!
  authDomain: "puertorealmobile.firebaseapp.com",
  projectId: "puertorealmobile",
  storageBucket: "puertorealmobile.appspot.com",
  messagingSenderId: "35576249240",
  appId: "1:35576249240:web:9c37276043fd8d442689ed",
  measurementId: "G-Z3XQC7VDCD"
};

// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Obtiene las instancias de los servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Exporta las instancias para ser usadas en otras partes de la aplicación
export { auth, db, storage };