import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput, Modal } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

// Dummy data - replace with your data from the database
const dummyPurchases = [
  { id: '3', codigo: 'COMPRA-003', proveedor: 'Proveedor C', fecha: '2025-09-20', importe: 300 },
  { id: '2', codigo: 'COMPRA-002', proveedor: 'Proveedor B', fecha: '2025-09-19', importe: 200 },
  { id: '1', codigo: 'COMPRA-001', proveedor: 'Proveedor A', fecha: '2025-09-18', importe: 100 },
];

export default function ControlCompras({ navigation }) {
  const user = auth.currentUser;
  const [purchases, setPurchases] = useState(dummyPurchases);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // State for the new purchase modal
  const [newProveedor, setNewProveedor] = useState(null);
  const [newItems, setNewItems] = useState([]);
  const [newImporte, setNewImporte] = useState(0);

  // State for the edit purchase modal
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editedProveedor, setEditedProveedor] = useState('');
  const [editedImporte, setEditedImporte] = useState('');

  // State for the view and delete purchase modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);


  useEffect(() => {
    // Calculate total amount whenever items change
    const total = newItems.reduce((sum, item) => sum + item.precio, 0);
    setNewImporte(total);
  }, [newItems]);

  const resetNewPurchaseState = () => {
    setNewProveedor(null);
    setNewItems([]);
    setNewImporte(0);
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  const handleAddPurchase = () => {
    resetNewPurchaseState();
    setIsAddModalVisible(true);
  };

  const handleSelectProveedor = () => {
    setNewProveedor({ id: '4', nombre: 'Proveedor D' });
    Alert.alert("Proveedor Seleccionado", "Proveedor D");
  };

  const handleSelectItems = () => {
    setNewItems([
      { id: '1', nombre: 'Item 1', precio: 50 },
      { id: '2', nombre: 'Item 2', precio: 150 },
    ]);
    Alert.alert("Items Agregados", "2 items agregados.");
  };

  const handleSavePurchase = () => {
    if (!newProveedor || newItems.length === 0) {
      Alert.alert("Error", "Por favor, seleccione un proveedor y al menos un item.");
      return;
    }
    const newPurchase = {
      id: Date.now().toString(),
      codigo: `COMPRA-00${purchases.length + 1}`,
      proveedor: newProveedor.nombre,
      fecha: new Date().toLocaleDateString(),
      importe: newImporte,
    };
    setPurchases([newPurchase, ...purchases]);
    setIsAddModalVisible(false);
    Alert.alert("Compra Guardada", "La nueva compra ha sido guardada.");
  };

  const handleViewPurchase = (item) => {
    setSelectedPurchase(item);
    setIsViewModalVisible(true);
  };

  const handleEditPurchase = (item) => {
    setEditingPurchase(item);
    setEditedProveedor(item.proveedor);
    setEditedImporte(item.importe.toString());
    setIsEditModalVisible(true);
  };

  const handleUpdatePurchase = () => {
    if (!editingPurchase) return;

    const updatedPurchases = purchases.map(p => {
      if (p.id === editingPurchase.id) {
        return { ...p, proveedor: editedProveedor, importe: parseFloat(editedImporte) || 0 };
      }
      return p;
    });

    setPurchases(updatedPurchases);
    setIsEditModalVisible(false);
    setEditingPurchase(null);
    Alert.alert("Compra Actualizada", "La compra ha sido actualizada.");
  };

  const handleDeletePurchase = (item) => {
    setSelectedPurchase(item);
    setIsDeleteModalVisible(true);
  };

  const confirmDeletePurchase = () => {
    if (!selectedPurchase) return;
    setPurchases(purchases.filter(p => p.id !== selectedPurchase.id));
    setIsDeleteModalVisible(false);
    setSelectedPurchase(null);
    Alert.alert("Compra Eliminada", "La compra ha sido eliminada.");
  };

  const handleExportToPdf = () => {
    if (!selectedPurchase) return;

    const htmlContent = `
      <h1>COMPRA #${selectedPurchase.codigo}</h1>
      <p><strong>Proveedor:</strong> ${selectedPurchase.proveedor}</p>
      <p><strong>Fecha:</strong> ${selectedPurchase.fecha}</p>
      <p><strong>Importe:</strong> ${selectedPurchase.importe}</p>
    `;

    Alert.alert(
      "Funcionalidad no implementada",
      "Para exportar a PDF, necesitas instalar una librería. Ejecuta el siguiente comando en tu terminal:\n\nnpm install react-native-html-to-pdf react-native-fs\n\nY luego, para iOS, ejecuta:\n\nnpx pod-install"
    );
  };

  const renderPurchaseItem = ({ item }) => (
    <View style={styles.purchaseItemContainer}>
      <View>
        <Text style={styles.purchaseCode}>{item.codigo}</Text>
        <Text>{item.proveedor}</Text>
        <Text>{item.fecha}</Text>
      </View>
      <View style={styles.purchaseItemActions}>
        <Text style={styles.purchaseAmount}>${item.importe}</Text>
        <TouchableOpacity onPress={() => handleViewPurchase(item)}><FontAwesome name="eye" size={24} color="#007AFF" /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditPurchase(item)}><FontAwesome name="pencil" size={24} color="#FF9500" /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePurchase(item)}><FontAwesome name="trash" size={24} color="#FF3B30" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Add Modal */}
      <Modal visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)} transparent={true} animationType="slide">
        {/* ... Add Modal Content ... */}
      </Modal>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} onRequestClose={() => setIsEditModalVisible(false)} transparent={true} animationType="slide">
        {/* ... Edit Modal Content ... */}
      </Modal>

      {/* View Modal */}
      <Modal visible={isViewModalVisible} onRequestClose={() => setIsViewModalVisible(false)} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedPurchase && (
              <>
                <Text style={styles.modalTitle}>COMPRA #{selectedPurchase.codigo}</Text>
                <Text style={styles.modalText}>Proveedor: {selectedPurchase.proveedor}</Text>
                <Text style={styles.modalText}>Fecha: {selectedPurchase.fecha}</Text>
                <Text style={styles.modalText}>Importe: ${selectedPurchase.importe}</Text>
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setIsViewModalVisible(false)}>
                    <Text style={styles.textStyle}>Cerrar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleExportToPdf}>
                    <Text style={styles.textStyle}>Exportar a PDF</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <FontAwesome name="exclamation-triangle" size={50} color="#FFC107" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>¿Estas seguro que deseas eliminar esta compra?</Text>
            <Text style={styles.modalSubText}>Esta operacion es irreversible</Text>
            <View style={styles.modalActionButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={() => setIsDeleteModalVisible(false)}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={confirmDeletePurchase}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.userInfoContainer}>
        <FontAwesome name="user-circle" size={24} color="black" />
        <Text style={styles.userName}>{user?.displayName || user?.email}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPurchase}>
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar compras..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.buttonText}>Filtros()</Text>
      </TouchableOpacity>

      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={item => item.id}
        style={styles.purchaseList}
      />

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  // ... other styles
  modalSubText: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#6c757d',
  },
  buttonCancel: {
    backgroundColor: '#6c757d',
    width: '48%',
    paddingVertical: 10,
  },
  buttonDelete: {
    backgroundColor: '#dc3545',
    width: '48%',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

