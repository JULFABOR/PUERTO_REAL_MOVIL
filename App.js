import React, { useCallback, useEffect, useState } from 'react';
import Navigation from './navigation/Navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    // ===================================================================
    // IMPORTANTE: Para que esto funcione, debes hacer lo siguiente:
    // 1. Crea una carpeta llamada 'fonts' dentro de tu carpeta 'assets'.
    // 2. Descarga los archivos de la fuente Lato (o la que prefieras).
    //    Puedes encontrarlos en Google Fonts: https://fonts.google.com/specimen/Lato
    // 3. Descarga y guarda los archivos 'Lato-Regular.ttf' y 'Lato-Bold.ttf' en la carpeta 'assets/fonts'.
    // ===================================================================
    'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
    'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Aquí puedes precargar otros recursos si es necesario
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen when the fonts are loaded
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Render nothing while fonts are loading
  }

  return <Navigation />;
}
