import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

// --- Colores y Estilos Reutilizados ---
const MAROON = '#922b21';
const YELLOW = '#F3F38B';
const BACKGROUND_IMAGE = require('../assets/splash.png');
const PINK_CARD = 'rgba(255, 228, 225, 0.85)';
const LIGHT_YELLOWISH = '#FFFACD'; // Pastel yellow for inputs/boxes
const DARK_GREY = '#3A3A3A';

// --- Datos de Ejemplo ---
const dummyPurchases = [
  { id: '3', codigo: 'COMPRA-003', proveedor: 'Proveedor C', fecha: '2025-09-20', importe: 300.50, items: [{name: 'Item 1', price: 100}, {name: 'Item 2', price: 200.50}] },
  { id: '2', codigo: 'COMPRA-002', proveedor: 'Proveedor B', fecha: '2025-09-19', importe: 200.00, items: [{name: 'Item A', price: 50}, {name: 'Item B', price: 150}] },
  { id: '1', codigo: 'COMPRA-001', proveedor: 'Proveedor A', fecha: '2025-09-18', importe: 150.75, items: [{name: 'Product X', price: 75.75}, {name: 'Product Y', price: 75}] },
];
const FILTER_OPTIONS = ['Codigo de la Compra', 'Proveedor', 'Fecha', 'Importe'];

// --- Componente Principal ---
export default function ControlCompras({ navigation }) {
  // --- Estados ---
  const user = auth.currentUser;
  const [purchases, setPurchases] = useState(dummyPurchases);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Add/Edit Modal States
  const [newProveedor, setNewProveedor] = useState('');
  const [newPurchaseItems, setNewPurchaseItems] = useState([]); // For items in new/edited purchase
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());

  // Edit Modal Specific States
  const [editingPurchase, setEditingPurchase] = useState(null);

  // View/Delete Modal Specific States
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // --- Effects ---
  useEffect(() => {
    if (editingPurchase) {
      setNewProveedor(editingPurchase.proveedor);
      setNewPurchaseItems(editingPurchase.items || []);
      setCurrentDate(editingPurchase.fecha);
    } else {
      resetAddEditModalState();
    }
  }, [editingPurchase]);

  // Calculate total importe for Add/Edit modal
  const totalImporte = newPurchaseItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  // --- Handlers ---
  const resetAddEditModalState = () => {
    setNewProveedor('');
    setNewPurchaseItems([]);
    setNewProductName('');
    setNewProductPrice('');
    setCurrentDate(new Date().toLocaleDateString());
    setEditingPurchase(null);
  };

  const handleAddPurchase = () => {
    resetAddEditModalState();
    setIsAddModalVisible(true);
  };

  const handleSavePurchase = () => {
    if (!newProveedor || newPurchaseItems.length === 0) {
      Alert.alert("Error", "Por favor, seleccione un proveedor y agregue al menos un producto.");
      return;
    }
    const newPurchase = {
      id: Date.now().toString(),
      codigo: `COMPRA-${(purchases.length + 1).toString().padStart(3, '0')}`,
      proveedor: newProveedor,
      fecha: new Date().toLocaleDateString(),
      importe: totalImporte,
      items: newPurchaseItems,
    };
    setPurchases([newPurchase, ...purchases]); // Add to top of list
    setIsAddModalVisible(false);
    Alert.alert("Éxito", "Compra agregada correctamente.");
  };

  const handleUpdatePurchase = () => {
    if (!editingPurchase) return;
    if (!newProveedor || newPurchaseItems.length === 0) {
      Alert.alert("Error", "Por favor, seleccione un proveedor y agregue al menos un producto.");
      return;
    }

    const updatedPurchases = purchases.map(p => {
      if (p.id === editingPurchase.id) {
        return { ...p, proveedor: newProveedor, importe: totalImporte, items: newPurchaseItems };
      }
      return p;
    });
    setPurchases(updatedPurchases);
    setIsEditModalVisible(false);
    Alert.alert("Éxito", "Compra actualizada correctamente.");
  };

  const handleViewPurchase = (item) => {
    setSelectedPurchase(item);
    setIsViewModalVisible(true);
  };

  const handleEditPurchase = (item) => {
    setEditingPurchase(item);
    setIsEditModalVisible(true);
  };

  const handleDeletePurchase = (item) => {
    setSelectedPurchase(item);
    setIsDeleteModalVisible(true);
  };

  const confirmDeletePurchase = () => {
    if (!selectedPurchase) return;
    setPurchases(purchases.filter(p => p.id !== selectedPurchase.id));
    setIsDeleteModalVisible(false);
    Alert.alert("Éxito", "Compra eliminada correctamente.");
  };

  const handleExportToPdf = () => {
    if (!selectedPurchase) return;
    Alert.alert("Exportar a PDF", "Funcionalidad de exportación a PDF no implementada.");
  };

  const handleSelectProveedor = () => {
    Alert.alert("Seleccionar Proveedor", "Aquí se abriría un modal/pantalla para seleccionar un proveedor.");
  };

  const handleAddItemToPurchase = () => {
    if (newProductName && newProductPrice) {
      setNewPurchaseItems(prev => [...prev, { name: newProductName, price: parseFloat(newProductPrice) }]);
      setNewProductName('');
      setNewProductPrice('');
    } else {
      Alert.alert("Error", "Ingrese nombre y precio para el producto.");
    }
  };

  const handleRemoveItemFromPurchase = (indexToRemove) => {
    setNewPurchaseItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Lógica de Filtros ---
  const toggleFilter = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // --- Renderizado de Item de Compra ---
  const renderPurchaseItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}><Text style={styles.cardLabel}>Código:</Text> {item.codigo}</Text>
        <Text style={styles.cardText}><Text style={styles.cardLabel}>Proveedor:</Text> {item.proveedor}</Text>
        <Text style={styles.cardText}><Text style={styles.cardLabel}>Fecha:</Text> {item.fecha}</Text>
        <Text style={styles.cardText}><Text style={styles.cardLabel}>Importe:</Text> ${item.importe.toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => handleViewPurchase(item)}>
            <FontAwesome name="eye" size={16} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditPurchase(item)}>
            <FontAwesome name="pencil" size={16} color={MAROON} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeletePurchase(item)}>
            <FontAwesome name="trash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- JSX Principal ---
  return (
    <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>

        {/* --- Top Controls (Add Button & Search Bar) --- */}
        <View style={styles.topControlsContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddPurchase}>
                <FontAwesome name="plus" size={30} color={MAROON} />
            </TouchableOpacity>
            <View style={styles.searchBarContainer}>
                <FontAwesome name="search" size={20} color="#fff" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Buscar..."
                    placeholderTextColor="#ddd"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>

        {/* --- Filter Controls --- */}
        <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setFiltersVisible(!filtersVisible)}>
                <Text style={styles.filterButtonText}>Filtros({selectedFilters.length})</Text>
                <FontAwesome name={filtersVisible ? "chevron-up" : "chevron-down"} size={16} color="#fff" />
            </TouchableOpacity>
            {filtersVisible && (
                <View style={styles.filterDropdown}>
                    {FILTER_OPTIONS.map(option => (
                        <TouchableOpacity key={option} style={styles.filterOption} onPress={() => toggleFilter(option)}>
                            <FontAwesome name={selectedFilters.includes(option) ? 'check-square-o' : 'square-o'} size={20} color="#fff" />
                            <Text style={styles.filterOptionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>

        {/* --- Main Maroon Box with Purchase List --- */}
        <View style={styles.maroonBox}>
            <View style={styles.listHeader}>
                <Text style={styles.headerText}>Código</Text>
                <Text style={styles.headerText}>Proveedor</Text>
                <Text style={styles.headerText}>Fecha</Text>
                <Text style={styles.headerText}>Importe</Text>
            </View>
            <FlatList
                data={purchases}
                renderItem={renderPurchaseItem}
                keyExtractor={item => item.id}
                style={styles.purchaseList}
            />
        </View>

      </SafeAreaView>

      {/* --- Modals --- */}

      {/* Add Purchase Modal */}
      <Modal visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsAddModalVisible(false)}>
              <FontAwesome name="times" size={24} color={DARK_GREY} />
            </TouchableOpacity>
            <FontAwesome name="plus-circle" size={30} color={MAROON} style={styles.modalIconLeft} />
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalTitle}>Agregar Nueva Compra</Text>

              <TouchableOpacity style={styles.modalFormButton} onPress={handleSelectProveedor}>
                <Text style={styles.modalFormButtonText}>Seleccionar un proveedor</Text>
              </TouchableOpacity>
              {newProveedor ? <Text style={styles.selectedText}>Proveedor: {newProveedor}</Text> : null}

              <TouchableOpacity style={styles.modalFormButton} onPress={() => Alert.alert("Seleccionar Items", "Aquí se abriría un modal/pantalla para seleccionar productos.")}>
                <Text style={styles.modalFormButtonText}>Ingrese uno o más productos aquí</Text>
              </TouchableOpacity>
              <View style={styles.itemsListContainer}>
                {newPurchaseItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemText}>{item.name} - ${item.price.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => handleRemoveItemFromPurchase(index)}>
                      <FontAwesome name="minus-circle" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Nombre del producto"
                    placeholderTextColor={DARK_GREY}
                    value={newProductName}
                    onChangeText={setNewProductName}
                  />
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Precio"
                    placeholderTextColor={DARK_GREY}
                    keyboardType="numeric"
                    value={newProductPrice}
                    onChangeText={setNewProductPrice}
                  />
                  <TouchableOpacity onPress={handleAddItemToPurchase}>
                    <FontAwesome name="plus-circle" size={24} color="green" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFormDisplay}>
                <Text style={styles.modalFormDisplayText}>Importe: ${totalImporte.toFixed(2)}</Text>
              </View>

              <View style={styles.modalFormDisplay}>
                <Text style={styles.modalFormDisplayText}>Fecha: {currentDate}</Text>
              </View>

              <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={handleSavePurchase}>
                <Text style={styles.modalButtonText}>GUARDAR</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsEditModalVisible(false)}>
              <FontAwesome name="times" size={24} color={DARK_GREY} />
            </TouchableOpacity>
            <FontAwesome name="pencil-square-o" size={30} color={MAROON} style={styles.modalIconLeft} />
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalTitle}>Editar Compra</Text>

              <TouchableOpacity style={styles.modalFormButton} onPress={handleSelectProveedor}>
                <Text style={styles.modalFormButtonText}>{newProveedor || "Seleccionar un proveedor"}</Text>
              </TouchableOpacity>
              {newProveedor ? <Text style={styles.selectedText}>Proveedor: {newProveedor}</Text> : null}

              <TouchableOpacity style={styles.modalFormButton} onPress={() => Alert.alert("Seleccionar Items", "Aquí se abriría un modal/pantalla para seleccionar productos.")}>
                <Text style={styles.modalFormButtonText}>Ingrese uno o más productos aquí</Text>
              </TouchableOpacity>
              <View style={styles.itemsListContainer}>
                {newPurchaseItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemText}>{item.name} - ${item.price.toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => handleRemoveItemFromPurchase(index)}>
                      <FontAwesome name="minus-circle" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Nombre del producto"
                    placeholderTextColor={DARK_GREY}
                    value={newProductName}
                    onChangeText={setNewProductName}
                  />
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Precio"
                    placeholderTextColor={DARK_GREY}
                    keyboardType="numeric"
                    value={newProductPrice}
                    onChangeText={setNewProductPrice}
                  />
                  <TouchableOpacity onPress={handleAddItemToPurchase}>
                    <FontAwesome name="plus-circle" size={24} color="green" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFormDisplay}>
                <Text style={styles.modalFormDisplayText}>Importe: ${totalImporte.toFixed(2)}</Text>
              </View>

              <View style={styles.modalFormDisplay}>
                <Text style={styles.modalFormDisplayText}>Fecha: {currentDate}</Text>
              </View>

              <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={handleUpdatePurchase}>
                <Text style={styles.modalButtonText}>GUARDAR CAMBIOS</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Purchase Modal */}
      <Modal visible={isViewModalVisible} onRequestClose={() => setIsViewModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsViewModalVisible(false)}>
              <FontAwesome name="times" size={24} color={DARK_GREY} />
            </TouchableOpacity>
            <FontAwesome name="info-circle" size={30} color={MAROON} style={styles.modalIconLeft} />
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalTitle}>Detalle de Compra</Text>

              {selectedPurchase && (
                <View style={styles.viewModalContent}>
                  <View style={styles.viewModalCodeBox}>
                    <Text style={styles.viewModalCodeText}>{selectedPurchase.codigo}</Text>
                  </View>
                  <View style={styles.viewModalDataBox}>
                    <Text style={styles.viewModalDataText}><Text style={styles.viewModalDataLabel}>Proveedor:</Text> {selectedPurchase.proveedor}</Text>
                    <Text style={styles.viewModalDataText}><Text style={styles.viewModalDataLabel}>Fecha:</Text> {selectedPurchase.fecha}</Text>
                    <Text style={styles.viewModalDataText}><Text style={styles.viewModalDataLabel}>Importe:</Text> ${selectedPurchase.importe.toFixed(2)}</Text>
                    <Text style={styles.viewModalDataText}><Text style={styles.viewModalDataLabel}>Productos:</Text></Text>
                    {selectedPurchase.items && selectedPurchase.items.map((item, index) => (
                      <Text key={index} style={styles.viewModalDataItem}>  - {item.name} (${item.price.toFixed(2)})</Text>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.modalButton, styles.modalExportButton]} onPress={handleExportToPdf}>
                    <Text style={styles.modalButtonText}>EXPORTAR A PDF</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Purchase Modal */}
      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsDeleteModalVisible(false)}>
              <FontAwesome name="times" size={24} color={DARK_GREY} />
            </TouchableOpacity>
            <View style={styles.deleteModalContent}>
              <View style={styles.deleteModalIconCircle}>
                <FontAwesome name="exclamation" size={40} color="white" />
              </View>
              <Text style={styles.deleteModalQuestion}>¿Estás seguro/a que deseas eliminar esta compra?</Text>
              <Text style={styles.deleteModalIrreversible}>Esta operación es irreversible</Text>
              <View style={styles.deleteModalButtonsContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.deleteModalCancelButton]} onPress={() => setIsDeleteModalVisible(false)}>
                  <Text style={styles.modalButtonText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.deleteModalConfirmButton]} onPress={confirmDeletePurchase}>
                  <Text style={styles.modalButtonText}>ELIMINAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  // Controles Superiores
  topControlsContainer: { flexDirection: 'row', width: '90%', marginTop: 20, alignItems: 'center', justifyContent: 'space-between' },
  addButton: { backgroundColor: YELLOW, padding: 15, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(146, 43, 33, 0.85)', borderRadius: 25, flex: 1, marginLeft: 15 },
  searchIcon: { marginHorizontal: 15 },
  searchBar: { color: '#fff', fontSize: 16, flex: 1, paddingVertical: 15 },
  // Filtros
  filterContainer: { width: '90%', marginTop: 15, zIndex: 10 },
  filterButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10 },
  filterButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  filterDropdown: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, marginTop: 5, padding: 10 },
  filterOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  filterOptionText: { color: '#fff', marginLeft: 10, fontSize: 16 },
  // Caja Principal y Lista
  maroonBox: { width: '90%', flex: 1, backgroundColor: 'rgba(146, 43, 33, 0.85)', borderRadius: 20, marginTop: 15, marginBottom: 20, padding: 15 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 10, marginBottom: 10 },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1, textAlign: 'center' },
  purchaseList: { flex: 1 },
  // Item de la Lista (Card)
  card: { flexDirection: 'row', backgroundColor: PINK_CARD, borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'center' },
  cardData: { flex: 1 },
  cardText: { color: '#000', fontSize: 14, marginBottom: 2 },
  cardLabel: { fontWeight: 'bold' },
  cardActions: { flexDirection: 'column', justifyContent: 'space-around', marginLeft: 10 },
  actionButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginVertical: 4 },
  viewButton: { backgroundColor: '#fff' },
  editButton: { backgroundColor: YELLOW },
  deleteButton: { backgroundColor: 'red' },

  // --- Modal Styles ---
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  modalIconLeft: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  modalScrollView: {
    width: '100%',
    marginTop: 40, // Space for close button and icon
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_GREY,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Form elements (Add/Edit)
  modalFormButton: {
    backgroundColor: MAROON,
    borderRadius: 25,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalFormButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 14,
    color: DARK_GREY,
    marginBottom: 10,
  },
  itemsListContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    backgroundColor: LIGHT_YELLOWISH,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemText: {
    color: DARK_GREY,
    fontSize: 14,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
    color: DARK_GREY,
  },
  modalFormDisplay: {
    backgroundColor: LIGHT_YELLOWISH,
    borderRadius: 25,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalFormDisplayText: {
    color: DARK_GREY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveButton: {
    backgroundColor: '#28a745', // Green
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // View Modal Specific
  viewModalContent: {
    width: '100%',
    alignItems: 'center',
  },
  viewModalCodeBox: {
    backgroundColor: MAROON,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  viewModalCodeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewModalDataBox: {
    backgroundColor: LIGHT_YELLOWISH,
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  viewModalDataText: {
    color: DARK_GREY,
    fontSize: 15,
    marginBottom: 5,
    fontFamily: 'Roboto', // Placeholder for Roboto-like font
  },
  viewModalDataLabel: {
    fontWeight: 'bold',
  },
  viewModalDataItem: {
    color: DARK_GREY,
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 2,
  },
  modalExportButton: {
    backgroundColor: MAROON,
  },
  // Delete Modal Specific
  deleteModalContent: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: LIGHT_YELLOWISH, // Yellowish box covering most of modal
    borderRadius: 20,
    padding: 20,
    marginTop: 50, // To leave space for white frame effect
  },
  deleteModalIconCircle: {
    backgroundColor: 'red',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -50, // Pull up into the white frame area
  },
  deleteModalQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GREY,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Roboto', // Placeholder for Roboto-like font
  },
  deleteModalIrreversible: {
    fontSize: 12,
    color: 'rgba(58, 58, 58, 0.7)', // Dark grey with transparency
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto', // Placeholder for Roboto-like font
  },
  deleteModalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  deleteModalCancelButton: {
    backgroundColor: '#6c757d', // Grey
    width: '48%',
  },
  deleteModalConfirmButton: {
    backgroundColor: 'red',
    width: '48%',
  },
});
