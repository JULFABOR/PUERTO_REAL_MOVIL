import React, { useEffect } from 'react';
import Navigation from './navigation/Navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './theme/ThemeContext';

// Mantener la pantalla de carga visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    // Fuentes originales
    'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
    'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
    
    // --- NUEVAS FUENTES ---
    // Asegúrate de haber descargado y colocado estos archivos en la carpeta /assets/fonts
    'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        // Ocultar la pantalla de carga una vez que las fuentes estén listas
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // No renderizar nada hasta que las fuentes se hayan cargado
  }

  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}