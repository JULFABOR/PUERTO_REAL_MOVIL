/**
 * @file Home.js
 * @description Pantalla principal de la aplicación que muestra las opciones de navegación a las diferentes secciones.
 * @author [Tu Nombre]
 */

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * Componente de la pantalla de inicio.
 * Muestra tarjetas de navegación a las principales funcionalidades de la app.
 * @returns {JSX.Element}
 */
export default function Home() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { t } = useTranslation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  /**
   * Muestra una alerta personalizada.
   * @param {string} title - Título de la alerta.
   * @param {string} message - Mensaje de la alerta.
   */
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tarjeta de navegación a Control de Compras */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ControlCompras')}>
          <FontAwesome name="shopping-cart" size={40} color={theme.primary} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>{t('home.purchases')}</Text>
          <Text style={styles.cardDescription}>{t('home.purchasesDescription')}</Text>
        </TouchableOpacity>
        
        {/* Tarjeta de navegación a Gestión de Proveedores */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GestionProveedores')}>
          <FontAwesome name="truck" size={40} color={theme.primary} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>{t('home.suppliers')}</Text>
          <Text style={styles.cardDescription}>{t('home.suppliersDescription')}</Text>
        </TouchableOpacity>
        
        {/* Tarjeta de navegación a Gestión de Stock */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GestionStock')}>
          <FontAwesome name="codepen" size={40} color={theme.primary} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>{t('home.stock')}</Text>
          <Text style={styles.cardDescription}>{t('home.stockDescription')}</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

/**
 * Genera los estilos para el componente basados en el tema.
 * @param {object} theme - El objeto de tema.
 * @returns {object} - Objeto de estilos de StyleSheet.
 */
const getStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: theme.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: theme.text,
    marginBottom: 5,
  },
  cardDescription: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
    opacity: 0.8,
  },
});
