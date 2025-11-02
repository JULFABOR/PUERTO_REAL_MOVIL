import './src/i18n/i18n'; // Import to initialize i18n
import React, { useEffect } from 'react';
import Navigation from './navigation/Navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './theme/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n';
import { AuthProvider } from './context/AuthContext';

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
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}