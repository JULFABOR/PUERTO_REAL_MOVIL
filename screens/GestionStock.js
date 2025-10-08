import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  FlatList,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig'; // Importar db
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert'; // Importar CustomAlert

// --- Colores y Estilos Reutilizados ---
const TERRACOTTA = '#d96c3d';
const DARK_GREY = '#3A3A3A';
const OFF_WHITE = '#FAF9F6';
const BACKGROUND_IMAGE = require('../assets/wine-cellar-573833.jpg');

// --- Componente Principal ---
export default function GestionStock({ navigation }) {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductName('');
    setProductCategory('');
    setProductStock('');
    setProductPrice('');
    setModalVisible(true);
  };

  const handleEditProduct = (item) => {
    setSelectedProduct(item);
    setProductName(item.name);
    setProductCategory(item.category);
    setProductStock(String(item.stock));
    setProductPrice(String(item.price));
    setModalVisible(true);
  };

  const handleDeleteProduct = (item) => {
    setProductToDelete(item);
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "products", productToDelete.id));
        setIsDeleteAlertVisible(false);
        setProductToDelete(null);
      } catch (error) {
        setAlertTitle('Error');
        setAlertMessage('No se pudo eliminar el producto.');
        setAlertVisible(true);
      }
    }
  };

  const handleSaveProduct = async () => {
    // Validación de campos obligatorios
    if (!productName || !productCategory || !productStock || !productPrice) {
      setAlertTitle('Error');
      setAlertMessage('Todos los campos son obligatorios.');
      setAlertVisible(true);
      return;
    }

    // Validación de nombre (sin caracteres especiales)
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(productName)) {
      setAlertTitle('Error');
      setAlertMessage('El nombre del producto solo puede contener letras, números y espacios.');
      setAlertVisible(true);
      return;
    }

    const stock = parseInt(productStock);
    const price = parseFloat(productPrice);

    // Validación de stock y precio (no negativos)
    if (stock < 0 || price < 0) {
      setAlertTitle('Error');
      setAlertMessage('El stock y el precio no pueden ser negativos.');
      setAlertVisible(true);
      return;
    }

    const productData = {
        name: productName,
        category: productCategory,
        stock: stock,
        price: price,
    };

    try {
        if (selectedProduct) {
          // Editar
          const productRef = doc(db, "products", selectedProduct.id);
          await updateDoc(productRef, productData);
        } else {
          // Añadir
          await addDoc(collection(db, "products"), productData);
        }
        setModalVisible(false);
    } catch (error) {
        setAlertTitle('Error');
        setAlertMessage('No se pudo guardar el producto.');
        setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          
          {/* --- Encabezado --- */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={OFF_WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gestión de Stock</Text>
            <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
              <Ionicons name="add" size={32} color={OFF_WHITE} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductItem 
                item={item} 
                onEdit={() => handleEditProduct(item)}
                onDelete={() => handleDeleteProduct(item)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedProduct ? 'Editar Producto' : 'Añadir Producto'}</Text>
                <TextInput placeholder="Nombre del Producto" value={productName} onChangeText={setProductName} style={styles.input} />
                <TextInput placeholder="Categoría" value={productCategory} onChangeText={setProductCategory} style={styles.input} />
                <TextInput placeholder="Stock (unidades)" value={productStock} onChangeText={setProductStock} style={styles.input} keyboardType="numeric" />
                <TextInput placeholder="Precio ($)" value={productPrice} onChangeText={setProductPrice} style={styles.input} keyboardType="decimal-pad" />
                <View style={styles.modalButtons}>
                    <Button title="Guardar" onPress={handleSaveProduct} color={TERRACOTTA} />
                    <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#888" />
                </View>
              </View>
            </View>
          </Modal>

          <CustomAlert
            visible={isDeleteAlertVisible}
            title="Confirmar Eliminación"
            message={`¿Estás seguro de que quieres eliminar "${productToDelete?.name}"?`}
            buttons={[
              { text: 'Cancelar', style: 'cancel', onPress: () => setIsDeleteAlertVisible(false) },
              { text: 'Eliminar', style: 'destructive', onPress: confirmDelete },
            ]}
            onClose={() => setIsDeleteAlertVisible(false)}
          />

          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

// --- Componente de Item de Producto ---
const ProductItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemDetails}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
      <View style={styles.itemStockInfo}>
        <Text style={styles.itemStock}>Stock: {item.stock} uds.</Text>
        <Text style={styles.itemPrice}>Precio: ${(item.price || 0).toFixed(2)}</Text>
      </View>
    </View>
    <View style={styles.itemActions}>
      <TouchableOpacity onPress={onEdit} style={[styles.actionButton, styles.editButton]}>
        <FontAwesome name="pencil" size={18} color={'#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
        <FontAwesome name="trash" size={18} color={'#fff'} />
      </TouchableOpacity>
    </View>
  </View>
);


// --- Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_GREY,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: { flex: 1 },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 3,
  },
  addButton: { flex: 1, alignItems: 'flex-end' },
  listContainer: {
    padding: 15,
  },
  itemContainer: {
    backgroundColor: OFF_WHITE,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 17,
    color: DARK_GREY,
  },
  itemCategory: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  itemStockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStock: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: DARK_GREY,
  },
  itemPrice: {
    fontFamily: 'Roboto-Bold',
    fontSize: 15,
    color: TERRACOTTA,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  }
});