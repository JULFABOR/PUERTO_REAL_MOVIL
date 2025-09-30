import React, { useState, useEffect } from 'react';
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
const dummyPurchases = [
  { id: '3', codigo: 'COMPRA-003', proveedor: 'Proveedor C', fecha: '2025-09-20', importe: 300.50, items: [{name: 'Item 1', price: 100}, {name: 'Item 2', price: 200.50}] },
  { id: '2', codigo: 'COMPRA-002', proveedor: 'Proveedor B', fecha: '2025-09-19', importe: 200.00, items: [{name: 'Item A', price: 50}, {name: 'Item B', price: 150}] },
  { id: '1', codigo: 'COMPRA-001', proveedor: 'Proveedor A', fecha: '2025-09-18', importe: 150.75, items: [{name: 'Product X', price: 75.75}, {name: 'Product Y', price: 75}] },
];

// --- Componente de Formulario Reutilizable ---
const PurchaseForm = ({ isEdit, purchaseData, onSave, onClose, showAlert }) => {
  const [proveedor, setProveedor] = useState(isEdit ? purchaseData.proveedor : '');
  const [items, setItems] = useState(isEdit ? purchaseData.items : []);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const totalImporte = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  const handleAddItem = () => {
    if (itemName && itemPrice) {
      setItems([...items, { name: itemName, price: parseFloat(itemPrice) }]);
      setItemName('');
      setItemPrice('');
    } else {
      showAlert("Error", "Ingrese nombre y precio para el producto.");
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = () => {
    onSave(proveedor, items, totalImporte);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitleText}>{isEdit ? 'Editar Compra' : 'Agregar Compra'}</Text>
          <TouchableOpacity onPress={onClose}><FontAwesome name="times-circle" size={30} color={DARK_GREY} /></TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.formLabel}>Proveedor</Text>
          <TouchableOpacity style={styles.formButton} onPress={() => showAlert("Info", "Funcionalidad no implementada.")}>
            <Text style={styles.formButtonText}>{proveedor || 'Seleccionar un proveedor'}</Text>
            <FontAwesome name="chevron-down" color={DARK_GREY} />
          </TouchableOpacity>

          <Text style={styles.formLabel}>Productos</Text>
          <View style={styles.formSection}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>{item.name} (${item.price.toFixed(2)})</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                  <FontAwesome name="trash" size={20} color={DANGER_RED} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput style={[styles.formInput, {flex: 2, marginRight: 8}]} placeholder="Nombre producto" value={itemName} onChangeText={setItemName} />
              <TextInput style={[styles.formInput, {flex: 1}]} placeholder="Precio" keyboardType="numeric" value={itemPrice} onChangeText={setItemPrice} />
              <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                <FontAwesome name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Importe Total:</Text>
            <Text style={styles.summaryValue}>${totalImporte.toFixed(2)}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <FontAwesome name={isEdit ? 'save' : 'plus'} size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>{isEdit ? 'Guardar Cambios' : 'Agregar Compra'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Componente Principal ---
export default function ControlCompras({ navigation }) {
  const [purchases, setPurchases] = useState(dummyPurchases);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSavePurchase = (proveedor, items, importe) => {
    if (!proveedor || items.length === 0) {
      showAlert("Error", "Proveedor y productos son obligatorios.");
      return;
    }
    const newPurchase = {
      id: Date.now().toString(),
      codigo: `COMPRA-${(purchases.length + 1).toString().padStart(3, '0')}`,
      proveedor,
      fecha: new Date().toLocaleDateString(),
      importe,
      items,
    };
    setPurchases([newPurchase, ...purchases]);
    setIsAddModalVisible(false);
  };

  const handleUpdatePurchase = (proveedor, items, importe) => {
    if (!editingPurchase) return;
    const updatedPurchases = purchases.map(p => 
      p.id === editingPurchase.id ? { ...p, proveedor, items, importe } : p
    );
    setPurchases(updatedPurchases);
    setEditingPurchase(null);
    setIsEditModalVisible(false);
  };

  const handleViewPurchase = (item) => { setSelectedPurchase(item); setIsViewModalVisible(true); };
  const handleEditPurchase = (item) => { setEditingPurchase(item); setIsEditModalVisible(true); };
  const handleDeletePurchase = (item) => { setSelectedPurchase(item); setIsDeleteModalVisible(true); };
  const confirmDeletePurchase = () => {
    if (!selectedPurchase) return;
    setPurchases(purchases.filter(p => p.id !== selectedPurchase.id));
    setIsDeleteModalVisible(false);
    showAlert("Éxito", "Compra eliminada correctamente.");
  };
  const handleExportToPdf = () => { showAlert("Info", "Funcionalidad no implementada."); };

  const renderPurchaseItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.codigo}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="truck" /> {item.proveedor}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="calendar" /> {item.fecha}</Text>
        <Text style={styles.cardAmount}>${item.importe.toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleViewPurchase(item)} style={styles.actionButton}><FontAwesome name="eye" size={20} color={DARK_GREY} /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditPurchase(item)} style={styles.actionButton}><FontAwesome name="pencil" size={20} color={DARK_GREY} /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePurchase(item)} style={styles.actionButton}><FontAwesome name="trash" size={20} color={TERRACOTTA} /></TouchableOpacity>
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
            <Text style={styles.headerTitle}>Control de Compras</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color={DARK_GREY} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder="Buscar..." placeholderTextColor={DARK_GREY} value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}><FontAwesome name="plus" size={20} color="#fff" /><Text style={styles.addButtonText}>Agregar</Text></TouchableOpacity>
          </View>
          <FlatList data={purchases} renderItem={renderPurchaseItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContainer} />
        </View>
      </ImageBackground>

      {/* --- Modales --- */}
      <Modal visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)} transparent={true} animationType="fade">
        <PurchaseForm onSave={handleSavePurchase} onClose={() => setIsAddModalVisible(false)} showAlert={showAlert} />
      </Modal>

      {editingPurchase && (
        <Modal visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)} transparent={true} animationType="fade">
          <PurchaseForm isEdit purchaseData={editingPurchase} onSave={handleUpdatePurchase} onClose={() => setIsEditModalVisible(false)} showAlert={showAlert} />
        </Modal>
      )}

      <Modal visible={isViewModalVisible} onRequestClose={() => setIsViewModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>Detalle de Compra</Text>
              <TouchableOpacity onPress={() => setIsViewModalVisible(false)}><FontAwesome name="times-circle" size={30} color={DARK_GREY} /></TouchableOpacity>
            </View>
            {selectedPurchase && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Código:</Text><Text style={styles.detailValue}>{selectedPurchase.codigo}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Proveedor:</Text><Text style={styles.detailValue}>{selectedPurchase.proveedor}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Fecha:</Text><Text style={styles.detailValue}>{selectedPurchase.fecha}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Importe Total:</Text><Text style={[styles.detailValue, { color: TERRACOTTA, fontFamily: 'Roboto-Bold' }]}>${selectedPurchase.importe.toFixed(2)}</Text></View>
                  <Text style={[styles.detailLabel, { marginTop: 15, marginBottom: 5 }]}>Productos:</Text>
                  <View style={styles.itemsContainer}>
                    {selectedPurchase.items && selectedPurchase.items.map((item, index) => (
                      <View key={index} style={styles.itemDetailRow}><Text style={styles.itemDetailName}>- {item.name}</Text><Text style={styles.itemDetailPrice}>${item.price.toFixed(2)}</Text></View>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity style={styles.primaryButton} onPress={handleExportToPdf}><FontAwesome name="file-pdf-o" size={20} color="#fff" /><Text style={styles.primaryButtonText}>Exportar a PDF</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>Confirmar Eliminación</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}><FontAwesome name="times-circle" size={30} color={DARK_GREY} /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.deleteIconContainer}><FontAwesome name="exclamation-triangle" size={50} color={DANGER_RED} /></View>
              <Text style={styles.deleteQuestion}>¿Estás seguro que deseas eliminar esta compra?</Text>
              {selectedPurchase && <Text style={styles.deleteInfo}>El registro <Text style={{fontFamily: 'Roboto-Bold'}}>{selectedPurchase.codigo}</Text> será eliminado de forma permanente.</Text>}
              <Text style={styles.deleteWarning}>Esta acción es irreversible.</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: DARK_GREY}]}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDeletePurchase}><Text style={styles.buttonText}>Eliminar</Text></TouchableOpacity>
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

// --- Hoja de Estilos Final --- 
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
  cardAmount: { fontFamily: 'Roboto-Bold', fontSize: 18, color: TERRACOTTA, marginTop: 8 },
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

  // Estilos Modal Ver
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailLabel: { fontFamily: 'Roboto-Bold', fontSize: 16, color: DARK_GREY },
  detailValue: { fontFamily: 'Roboto-Regular', fontSize: 16, color: DARK_GREY, flexShrink: 1, textAlign: 'right' },
  itemsContainer: { backgroundColor: '#F0F0F0', borderRadius: 10, padding: 10, marginTop: 5 },
  itemDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemDetailName: { fontFamily: 'Roboto-Regular', fontSize: 15, color: DARK_GREY },
  itemDetailPrice: { fontFamily: 'Roboto-Bold', fontSize: 15, color: DARK_GREY },

  // Estilos Modal Eliminar
  deleteIconContainer: { alignItems: 'center', marginVertical: 20 },
  deleteQuestion: { fontFamily: 'Roboto-Bold', fontSize: 18, color: DARK_GREY, textAlign: 'center', marginBottom: 10 },
  deleteInfo: { fontFamily: 'Roboto-Regular', fontSize: 14, color: DARK_GREY, textAlign: 'center', marginBottom: 5 },
  deleteWarning: { fontFamily: 'Roboto-Regular', fontSize: 12, color: DANGER_RED, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: LIGHT_GREY, marginRight: 10 },
  deleteButton: { backgroundColor: DANGER_RED },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Roboto-Bold' },

  // Estilos Formulario Agregar/Editar
  formLabel: { fontFamily: 'Roboto-Bold', fontSize: 16, color: DARK_GREY, marginBottom: 8, marginTop: 10 },
  formButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: LIGHT_GREY, borderRadius: 8, padding: 15, marginBottom: 15 },
  formButtonText: { fontFamily: 'Roboto-Regular', fontSize: 16, color: DARK_GREY },
  formSection: { backgroundColor: '#F0F0F0', borderRadius: 10, padding: 15, marginBottom: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#fff' },
  itemText: { fontFamily: 'Roboto-Regular', fontSize: 16, color: DARK_GREY },
  addItemContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  formInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, color: DARK_GREY, height: 45 },
  addItemButton: { backgroundColor: SUCCESS_GREEN, borderRadius: 8, padding: 10, marginLeft: 8, height: 45, justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: LIGHT_GREY },
  summaryLabel: { fontFamily: 'Roboto-Regular', fontSize: 18, color: DARK_GREY },
  summaryValue: { fontFamily: 'Roboto-Bold', fontSize: 20, color: TERRACOTTA },
});