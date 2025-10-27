/**
 * @file HelpScreen.js
 * @description Pantalla de ayuda con preguntas frecuentes (FAQ) y contacto.
 */

import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * Componente de la pantalla de Ayuda.
 * Muestra una lista de preguntas frecuentes y una opción de contacto.
 * @returns {JSX.Element}
 */
const HelpScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const styles = getStyles(theme);

  // Lista de preguntas y respuestas frecuentes
  const faqs = [
    {
      q: t('help.q1'),
      a: t('help.a1')
    },
    {
      q: t('help.q2'),
      a: t('help.a2')
    },
    {
      q: t('help.q3'),
      a: t('help.a3')
    },
    {
      q: t('help.q4'),
      a: t('help.a4')
    },
    {
      q: t('help.q5'),
      a: t('help.a5')
    }
  ];

  /**
   * Maneja la acción de presionar el botón de contacto.
   * Abre el cliente de correo electrónico del dispositivo.
   */
  const handleContactPress = () => {
    Linking.openURL(t('help.contactEmail'));
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('help.title')}</Text>
      </View>

      {/* Sección de Preguntas Frecuentes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('help.faqTitle')}</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </View>

      {/* Sección de Contacto */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('help.contact')}</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Ionicons name="mail-outline" size={24} color={theme.primary} />
            <Text style={styles.contactText}>{t('help.contactButton')}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
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
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
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
    marginBottom: 15,
  },
  faqItem: {
    marginBottom: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 15,
    color: theme.text,
    opacity: 0.8,
    lineHeight: 22,
  },
  contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
  },
  contactText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 15,
  }
});

export default HelpScreen;