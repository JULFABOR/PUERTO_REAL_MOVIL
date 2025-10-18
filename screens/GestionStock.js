/**
 * @file GestionStock.js
 * @description Pantalla para la gestión de productos en stock, permitiendo operaciones CRUD.
 * @author [Tu Nombre]
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
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

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
    setIsDeleteAlertVisible(true);
  };

  /**
   * Confirma y ejecuta la eliminación de un producto.
   */
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "products", productToDelete.id));
        setIsDeleteAlertVisible(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={theme.card} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('stock.title')}</Text>
            <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
              <Ionicons name="add" size={32} color={theme.card} />
            </TouchableOpacity>
          </View>

          {/* Lista de productos */}
          <FlatList
            data={products}
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

          {/* Alerta de confirmación de eliminación */}
          <CustomAlert
            visible={isDeleteAlertVisible}
            title={t('stock.delete_modal_title')}
            message={t('stock.delete_modal_message', { name: productToDelete?.name })}
            buttons={[
              { text: t('stock.delete_modal_cancel_button'), style: 'cancel', onPress: () => setIsDeleteAlertVisible(false) },
              { text: t('stock.delete_modal_confirm_button'), style: 'destructive', onPress: confirmDelete },
            ]}
            onClose={() => setIsDeleteAlertVisible(false)}
          />

          {/* Alerta para otros mensajes */}
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
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.category}</Text>
        <View style={styles.cardInfoRow}>
          <Text style={styles.cardInfo}>{t('stock.stock_label', { stock: item.stock })}</Text>
          <Text style={styles.cardPrice}>{t('stock.price_label', { price: (item.price || 0).toFixed(2) })}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}><FontAwesome name="pencil" size={20} color={theme.text} /></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}><FontAwesome name="trash" size={20} color={theme.primary} /></TouchableOpacity>
      </View>
    </View>
  );
};
