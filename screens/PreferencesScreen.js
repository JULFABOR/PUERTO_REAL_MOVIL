/**
 * @file PreferencesScreen.js
 * @description Pantalla para que el usuario configure sus preferencias, como el tema y el idioma.
 */

import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';

/**
 * Componente de la pantalla de Preferencias.
 * Permite al usuario cambiar el tema (claro/oscuro) y el idioma de la aplicación.
 * @returns {JSX.Element}
 */
const PreferencesScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const styles = getStyles(theme);

  /**
   * Cambia el idioma de la aplicación.
   * @param {string} lng - El código del idioma a establecer (e.g., 'es', 'en').
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageOptions(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('preferences')}</Text>
      </View>
      
      {/* Sección de Apariencia */}
      <View style={styles.card}>
        <PreferenceItem
          label={t('darkMode')}
          value={isDarkMode}
          onValueChange={toggleTheme}
          icon="moon-outline"
          theme={theme}
        />
      </View>

      {/* Sección de Cuenta (Idioma) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('account')}</Text>
        <OptionButton 
          text={t('changeLanguage')} 
          icon="language-outline" 
          theme={theme} 
          onPress={() => setShowLanguageOptions(!showLanguageOptions)}
        />
        {showLanguageOptions && (
          <View style={styles.languageOptionsContainer}>
            <TouchableOpacity 
              style={styles.languageButton} 
              onPress={() => changeLanguage('es')}
            >
              <Text style={[styles.languageText, i18n.language === 'es' && styles.languageTextActive]}>{t('spanish')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.languageButton} 
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.languageText, i18n.language === 'en' && styles.languageTextActive]}>{t('english')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
    </ScrollView>
  );
};

/**
 * Componente para un item de preferencia con un interruptor (Switch).
 * @param {object} props - Propiedades del componente.
 * @param {string} props.label - Etiqueta de la preferencia.
 * @param {boolean} props.value - Valor actual del interruptor.
 * @param {function} props.onValueChange - Función a llamar cuando cambia el valor.
 * @param {string} props.icon - Nombre del icono de Ionicons.
 * @param {object} props.theme - Objeto de tema para estilos.
 * @returns {JSX.Element}
 */
const PreferenceItem = ({ label, value, onValueChange, icon, theme }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.preferenceItem}>
            <Ionicons name={icon} size={24} color={theme.primary} style={styles.icon} />
            <Text style={styles.preferenceLabel}>{label}</Text>
            <Switch
              trackColor={{ false: theme.switchTrack, true: "#f5dd4b" }}
              thumbColor={value ? theme.primary : theme.switchThumb}
              ios_backgroundColor="#3e3e3e"
              onValueChange={onValueChange}
              value={value}
            />
        </View>
    );
};

/**
 * Componente para un botón de opción que puede ejecutar una acción.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.text - Texto del botón.
 * @param {string} props.icon - Nombre del icono de Ionicons.
 * @param {object} props.theme - Objeto de tema para estilos.
 * @param {function} props.onPress - Función a ejecutar al presionar.
 * @returns {JSX.Element}
 */
const OptionButton = ({ text, icon, theme, onPress }) => {
    const styles = getStyles(theme);
    return (
        <TouchableOpacity style={styles.preferenceItem} onPress={onPress} disabled={!onPress}>
            <Ionicons name={icon} size={24} color={theme.primary} style={styles.icon} />
            <Text style={styles.preferenceLabel}>{text}</Text>
            <Ionicons name="chevron-forward-outline" size={24} color={theme.text} />
        </TouchableOpacity>
    );
};

/**
 * Genera los estilos para el componente basados en el tema.
 * @param {object} theme - El objeto de tema.
 * @returns {object} - Objeto de estilos de StyleSheet.
 */
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.card,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
},
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  icon: {
    marginRight: 15,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  languageOptionsContainer: {
    paddingLeft: 55, // Alineado con las etiquetas
    paddingBottom: 10,
  },
  languageButton: {
    paddingVertical: 10,
  },
  languageText: {
    fontSize: 16,
    color: theme.text,
  },
  languageTextActive: {
    color: theme.primary,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
