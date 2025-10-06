import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';

const HelpScreen = () => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const faqs = [
    {
      q: '¿Cómo puedo cambiar mi contraseña?',
      a: 'Puedes cambiar tu contraseña desde la pantalla de "Perfil de Usuario", seleccionando la opción "Cambiar Contraseña".'
    },
    {
      q: '¿Dónde puedo ver mis análisis guardados?',
      a: 'La sección de "Análisis" en el menú principal contiene todo tu historial de análisis de vinos.'
    },
    {
      q: '¿Es posible exportar mis datos?',
      a: 'Actualmente estamos trabajando en una función para exportar tus datos. ¡Estará disponible muy pronto!'
    }
  ];

  const handleContactPress = () => {
    Linking.openURL('mailto:soporte@puertorealwines.com?subject=Ayuda%20desde%20la%20App');
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preguntas Frecuentes (FAQ)</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contacto</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Ionicons name="mail-outline" size={24} color={theme.primary} />
            <Text style={styles.contactText}>Contactar por Email</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

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
