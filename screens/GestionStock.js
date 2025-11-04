/**
 * @file GestionStock.js
 * @description Pantalla para la gestión de productos en stock, permitiendo operaciones CRUD.
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';
import { getCrudStyles } from '../theme/crudStyles';

const BACKGROUND_IMAGE = require('../assets/wine-cellar-573833.jpg');

/**
 * Componente de formulario para añadir o editar un producto.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función para guardar el producto.
 * @param {object} props.product - El producto a editar (nulo si es nuevo).
 * @param {object} props.theme - Objeto de tema para estilos.
 * @returns {JSX.Element}
 */
const ProductForm = ({ visible, onClose, onSave, product, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');

  /**
   * Efecto para rellenar el formulario con los datos del producto a editar.
   */
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setStock(product.stock ? String(product.stock) : '');
      setPrice(product.price ? String(product.price) : '');
    } else {
      setName('');
      setCategory('');
      setStock('');
      setPrice('');
    }
  }, [product]);

  /**
   * Maneja el guardado de los datos del producto.
   */
  const handleSave = () => {
    onSave({ name, category, stock, price });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitleText}>{product ? t('stock.modal_title_edit') : t('stock.modal_title_add')}</Text>
                <TouchableOpacity onPress={onClose}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <ScrollView>
                <Text style={styles.formLabel}>{t('stock.product_name_label')}</Text>
                <TextInput placeholder={t('stock.product_name_placeholder')} value={name} onChangeText={setName} style={styles.formInput} placeholderTextColor={theme.text} />
                
                <Text style={styles.formLabel}>{t('stock.category_label')}</Text>
                <TextInput placeholder={t('stock.category_placeholder')} value={category} onChangeText={setCategory} style={styles.formInput} placeholderTextColor={theme.text} />
                
                <Text style={styles.formLabel}>{t('stock.quantity_label')}</Text>
                <TextInput placeholder={t('stock.quantity_placeholder')} value={stock} onChangeText={setStock} style={styles.formInput} keyboardType="numeric" placeholderTextColor={theme.text} />
                
                <Text style={styles.formLabel}>{t('stock.price_label')}</Text>
                <TextInput placeholder={t('stock.price_placeholder')} value={price} onChangeText={setPrice} style={styles.formInput} keyboardType="decimal-pad" placeholderTextColor={theme.text} />
            </ScrollView>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <FontAwesome name={product ? 'save' : 'plus'} size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>{t('stock.save_button')}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Componente principal para la gestión del stock de productos.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación.
 * @returns {JSX.Element}
 */
export default function GestionStock({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = getCrudStyles(theme);

  // Variables de estado
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Efecto para obtener los productos de Firestore en tiempo real.
   */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Abre el modal para añadir un nuevo producto.
   */
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  /**
   * Abre el modal para editar un producto existente.
   * @param {object} item - El producto a editar.
   */
  const handleEditProduct = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  /**
   * Muestra la alerta de confirmación para eliminar un producto.
   * @param {object} item - El producto a eliminar.
   */
  const handleDeleteProduct = (item) => {
    setProductToDelete(item);
    setIsDeleteModalVisible(true);
  };

  /**
   * Confirma y ejecuta la eliminación de un producto.
   */
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "products", productToDelete.id));
        setIsDeleteModalVisible(false);
        setProductToDelete(null);
      } catch (error) {
        setAlertTitle(t('error'));
        setAlertMessage(t('stock.error_delete'));
        setAlertVisible(true);
      }
    }
  };

  /**
   * Guarda un producto nuevo o actualizado en Firestore.
   * @param {object} productData - Datos del producto a guardar.
   */
  const handleSaveProduct = async (productData) => {
    const { name, category, stock, price } = productData;
    if (!name || !category || !stock || !price) {
      setAlertTitle(t('error'));
      setAlertMessage(t('allFieldsRequired'));
      setAlertVisible(true);
      return;
    }

    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(name)) {
      setAlertTitle(t('error'));
      setAlertMessage(t('stock.invalid_name'));
      setAlertVisible(true);
      return;
    }

    const stockNum = parseInt(stock);
    const priceNum = parseFloat(price);

    if (stockNum < 0 || priceNum < 0) {
      setAlertTitle(t('error'));
      setAlertMessage(t('stock.negative_values'));
      setAlertVisible(true);
      return;
    }

    const dataToSave = {
        name,
        category,
        stock: stockNum,
        price: priceNum,
    };

    try {
        if (selectedProduct) {
          const productRef = doc(db, "products", selectedProduct.id);
          await updateDoc(productRef, dataToSave);
        } else {
          await addDoc(collection(db, "products"), dataToSave);
        }
        setModalVisible(false);
    } catch (error) {
        setAlertTitle(t('error'));
        setAlertMessage(t('stock.error_save'));
        setAlertVisible(true);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} />
          <View style={{flex: 1, backgroundColor: theme.background}}>
            {/* Encabezado */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color={theme.primary} />
              </TouchableOpacity>
              <Text style={{...styles.headerTitle, color: theme.text}}>{t('stock.title')}</Text>
              <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
                <Ionicons name="add" size={32} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Búsqueda y controles */}
            <View style={styles.controlsContainer}>
              <View style={styles.searchContainer}>
                <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} />
                <TextInput style={styles.searchInput} placeholder={t('stock.searchPlaceholder')} placeholderTextColor={theme.text} value={searchQuery} onChangeText={setSearchQuery} />
              </View>
            </View>
  
            {/* Lista de productos */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductItem 
                  item={item} 
                  onEdit={() => handleEditProduct(item)}
                  onDelete={() => handleDeleteProduct(item)}
                  theme={theme}
                />
              )}
              contentContainerStyle={styles.listContainer}
            />
  
            {/* Formulario de producto (Modal) */}
            <ProductForm 
              visible={modalVisible}
              onClose={() => setModalVisible(false)} 
              onSave={handleSaveProduct} 
              product={selectedProduct} 
              theme={theme} 
            />
  
            {/* Modal de confirmación de eliminación */}
            <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitleText}>{t('stock.delete_modal_title')}</Text>
                    <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
                  </View>
                  <View style={styles.modalBody}>
                    <View style={styles.deleteIconContainer}><FontAwesome name="exclamation-triangle" size={50} color={theme.primary} /></View>
                    <Text style={styles.deleteQuestion}>{t('stock.delete_modal_message')}</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: theme.text}]}>{t('stock.delete_modal_cancel_button')}</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}><Text style={styles.buttonText}>{t('stock.delete_modal_confirm_button')}</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
  
            {/* Alerta para otros mensajes */}
            <CustomAlert
              visible={alertVisible}
              title={alertTitle}
              message={alertMessage}
              onClose={() => setAlertVisible(false)}
            />
  
          </View>
      </SafeAreaView>
    );}

/**
 * Componente para renderizar un único producto en la lista.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.item - Datos del producto.
 * @param {function} props.onEdit - Función a llamar para editar el producto.
 * @param {function} props.onDelete - Función a llamar para eliminar el producto.
 * @param {object} props.theme - Objeto de tema para estilos.
 * @returns {JSX.Element}
 */
const ProductItem = ({ item, onEdit, onDelete, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.category}</Text>
            <View style={styles.cardInfoRow}>
            <Text style={styles.cardInfo}>{t('stock.stock_label', { stock: item.stock })}</Text>
            <Text style={styles.cardPrice}>{t('stock.price_label', { price: (item.price || 0).toFixed(2) })}</Text>
            </View>
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.cardActions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <FontAwesome name="pencil" size={20} color={theme.text} />
                <Text style={styles.actionButtonText}>{t('stock.edit_button')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <FontAwesome name="trash" size={20} color={theme.primary} />
                <Text style={{...styles.actionButtonText, color: theme.primary}}>{t('stock.delete_button')}</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
