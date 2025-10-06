import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';

const PreferencesScreen = () => {
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = React.useState(true);
  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferencias</Text>
      </View>
      
      <View style={styles.card}>
        <PreferenceItem
          label="Activar Notificaciones"
          value={notifications}
          onValueChange={setNotifications}
          icon="notifications-outline"
          theme={theme}
        />
        <PreferenceItem
          label="Modo Oscuro"
          value={isDarkMode}
          onValueChange={toggleTheme}
          icon="moon-outline"
          theme={theme}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cuenta</Text>
        <OptionButton text="Cambiar Idioma" icon="language-outline" theme={theme} />
        <OptionButton text="Gestionar Suscripción" icon="card-outline" theme={theme} />
      </View>
      
    </ScrollView>
  );
};

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

const OptionButton = ({ text, icon, theme }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.preferenceItem}>
            <Ionicons name={icon} size={24} color={theme.primary} style={styles.icon} />
            <Text style={styles.preferenceLabel}>{text}</Text>
            <Ionicons name="chevron-forward-outline" size={24} color={theme.text} />
        </View>
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
});

export default PreferencesScreen;
