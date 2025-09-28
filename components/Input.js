import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Input = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, accessibilityLabel, accessibilityHint }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      <FontAwesome name={icon} size={20} color='#3A3A3A' style={styles.inputIcon} />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: { flex: 1, fontSize: 16 },
  inputIcon: {
    marginLeft: 10,
    opacity: 0.5,
  },
});

export default Input;
