import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';

const PreferencesScreen = () => {
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const styles = getStyles(theme);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageOptions(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('preferences')}</Text>
      </View>
      
      <View style={styles.card}>
        <PreferenceItem
          label={t('enableNotifications')}
          value={notifications}
          onValueChange={setNotifications}
          icon="notifications-outline"
          theme={theme}
        />
        <PreferenceItem
          label={t('darkMode')}
          value={isDarkMode}
          onValueChange={toggleTheme}
          icon="moon-outline"
          theme={theme}
        />
      </View>

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
  languageOptionsContainer: {
    paddingLeft: 55, // Align with labels
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