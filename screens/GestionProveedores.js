import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

// --- Colores y Estilos Reutilizados ---
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const OFF_WHITE = '#FAF9F6';
const LIGHT_GREY = '#E0E0E0';
const DANGER_RED = '#D9534F';
const SUCCESS_GREEN = '#5CB85C';
const BACKGROUND_IMAGE = require('../assets/vine-9039366.jpg');

// --- Datos de Ejemplo ---
const dummyProveedores = [
  { id: '1', name: 'Bodegas El Sol', contactPerson: 'Juan Pérez', phone: '123-456-7890', email: 'juan.perez@elsol.com' },
  { id: '2', name: 'Viñedos La Luna', contactPerson: 'Ana Gómez', phone: '987-654-3210', email: 'ana.gomez@laluna.com' },
  { id: '3', name: 'Distribuidora Estrella', contactPerson: 'Carlos Ruiz', phone: '555-555-5555', email: 'carlos.ruiz@estrella.com' },
];

// --- Componente de Formulario Reutilizable ---
const ProveedorForm = ({ isEdit, proveedorData, onSave, onClose, showAlert }) => {
  const [name, setName] = useState(isEdit ? proveedorData.name : '');
  const [contactPerson, setContactPerson] = useState(isEdit ? proveedorData.contactPerson : '');
  const [phone, setPhone] = useState(isEdit ? proveedorData.phone : '');
  const [email, setEmail] = useState(isEdit ? proveedorData.email : '');

  const handleSave = () => {
    if (!name || !contactPerson || !phone || !email) {
      showAlert("Error", "Todos los campos son obligatorios.");
      return;
    }
    onSave({ name, contactPerson, phone, email });
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitleText}>{isEdit ? 'Editar Proveedor' : 'Agregar Proveedor'}</Text>
          <TouchableOpacity onPress={onClose}><FontAwesome name="times-circle" size={30} color={DARK_GREY} /></TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.formLabel}>Nombre de la Empresa</Text>
          <TextInput style={styles.formInput} placeholder="Ej: Bodegas El Sol" value={name} onChangeText={setName} />
          
          <Text style={styles.formLabel}>Persona de Contacto</Text>
          <TextInput style={styles.formInput} placeholder="Ej: Juan Pérez" value={contactPerson} onChangeText={setContactPerson} />

          <Text style={styles.formLabel}>Teléfono</Text>
          <TextInput style={styles.formInput} placeholder="Ej: 123-456-7890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.formLabel}>Correo Electrónico</Text>
          <TextInput style={styles.formInput} placeholder="Ej: juan.perez@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </ScrollView>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <FontAwesome name={isEdit ? 'save' : 'plus'} size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>{isEdit ? 'Guardar Cambios' : 'Agregar Proveedor'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Componente Principal ---
export default function GestionProveedores({ navigation }) {
  const [proveedores, setProveedores] = useState(dummyProveedores);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [deletingProveedor, setDeletingProveedor] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSaveProveedor = (data) => {
    const newProveedor = {
      id: Date.now().toString(),
      ...data,
    };
    setProveedores([newProveedor, ...proveedores]);
    setIsAddModalVisible(false);
    showAlert("Éxito", "Proveedor agregado correctamente.");
  };

  const handleUpdateProveedor = (data) => {
    if (!editingProveedor) return;
    const updatedProveedores = proveedores.map(p => 
      p.id === editingProveedor.id ? { ...p, ...data } : p
    );
    setProveedores(updatedProveedores);
    setEditingProveedor(null);
    setIsEditModalVisible(false);
    showAlert("Éxito", "Proveedor actualizado correctamente.");
  };

  const handleEdit = (proveedor) => { setEditingProveedor(proveedor); setIsEditModalVisible(true); };
  const handleDelete = (proveedor) => { setDeletingProveedor(proveedor); setIsDeleteModalVisible(true); };

  const confirmDelete = () => {
    if (!deletingProveedor) return;
    setProveedores(proveedores.filter(p => p.id !== deletingProveedor.id));
    setIsDeleteModalVisible(false);
    setDeletingProveedor(null);
    showAlert("Éxito", "Proveedor eliminado correctamente.");
  };

  const renderProveedorItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="user" /> {item.contactPerson}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="phone" /> {item.phone}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="envelope" /> {item.email}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}><FontAwesome name="pencil" size={20} color={DARK_GREY} /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}><FontAwesome name="trash" size={20} color={DANGER_RED} /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><FontAwesome name="arrow-left" size={24} color={OFF_WHITE} /></TouchableOpacity>
            <Text style={styles.headerTitle}>Gestión de Proveedores</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color={DARK_GREY} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder="Buscar proveedor..." placeholderTextColor={DARK_GREY} value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}><FontAwesome name="plus" size={20} color="#fff" /><Text style={styles.addButtonText}>Agregar</Text></TouchableOpacity>
          </View>
          <FlatList data={proveedores} renderItem={renderProveedorItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContainer} />
        </View>
      </ImageBackground>

      {/* --- Modales --- */}
      <Modal visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)} transparent={true} animationType="fade">
        <ProveedorForm onSave={handleSaveProveedor} onClose={() => setIsAddModalVisible(false)} showAlert={showAlert} />
      </Modal>

      {editingProveedor && (
        <Modal visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)} transparent={true} animationType="fade">
          <ProveedorForm isEdit proveedorData={editingProveedor} onSave={handleUpdateProveedor} onClose={() => setIsEditModalVisible(false)} showAlert={showAlert} />
        </Modal>
      )}

      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>Confirmar Eliminación</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}><FontAwesome name="times-circle" size={30} color={DARK_GREY} /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.deleteIconContainer}><FontAwesome name="exclamation-triangle" size={50} color={DANGER_RED} /></View>
              <Text style={styles.deleteQuestion}>¿Estás seguro que deseas eliminar este proveedor?</Text>
              {deletingProveedor && <Text style={styles.deleteInfo}>El proveedor <Text style={{fontFamily: 'Roboto-Bold'}}>{deletingProveedor.name}</Text> será eliminado.</Text>}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: DARK_GREY}]}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}><Text style={styles.buttonText}>Eliminar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

    </SafeAreaView>
  );
}

// --- Hoja de Estilos --- 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_GREY, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontFamily: 'Roboto-Bold', fontSize: 22, color: '#FFFFFF' },
  controlsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: OFF_WHITE, borderRadius: 10, paddingHorizontal: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontFamily: 'Roboto-Regular', fontSize: 16, color: DARK_GREY },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: TERRACOTTA, paddingHorizontal: 15, height: 45, borderRadius: 10, marginLeft: 10 },
  addButtonText: { fontFamily: 'Roboto-Bold', color: '#fff', fontSize: 16, marginLeft: 5 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  card: { backgroundColor: OFF_WHITE, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Roboto-Bold', fontSize: 18, color: DARK_GREY, marginBottom: 8 },
  cardInfo: { fontFamily: 'Roboto-Regular', fontSize: 14, color: DARK_GREY, marginBottom: 4 },
  cardActions: { flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: LIGHT_GREY, paddingLeft: 15, marginLeft: 15 },
  actionButton: { padding: 8 },

  // --- Estilos para Modales ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: OFF_WHITE, borderRadius: 15, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: LIGHT_GREY, paddingBottom: 10, marginBottom: 15 },
  modalTitleText: { fontFamily: 'Roboto-Bold', fontSize: 22, color: DARK_GREY },
  modalBody: { flexShrink: 1, width: '100%' },
  primaryButton: { flexDirection: 'row', backgroundColor: TERRACOTTA, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold', marginLeft: 10 },

  // Estilos Modal Eliminar
  deleteIconContainer: { alignItems: 'center', marginVertical: 20 },
  deleteQuestion: { fontFamily: 'Roboto-Bold', fontSize: 18, color: DARK_GREY, textAlign: 'center', marginBottom: 10 },
  deleteInfo: { fontFamily: 'Roboto-Regular', fontSize: 14, color: DARK_GREY, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: LIGHT_GREY, marginRight: 10 },
  deleteButton: { backgroundColor: DANGER_RED },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Roboto-Bold' },

  // Estilos Formulario Agregar/Editar
  formLabel: { fontFamily: 'Roboto-Bold', fontSize: 16, color: DARK_GREY, marginBottom: 8, marginTop: 10 },
  formInput: { backgroundColor: LIGHT_GREY, borderRadius: 8, padding: 15, fontSize: 16, color: DARK_GREY, marginBottom: 15, height: 50 },
  formButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: LIGHT_GREY, borderRadius: 8, padding: 15, marginBottom: 15 },
  formButtonText: { fontFamily: 'Roboto-Regular', fontSize: 16, color: DARK_GREY },
});
