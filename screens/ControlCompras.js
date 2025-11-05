/**
 * @file ControlCompras.js
 * @description Pantalla para la gestión de compras, incluyendo operaciones CRUD.
 */

import React, { useState, useEffect, useContext } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, getDocs, query, orderBy } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';
import { getCrudStyles } from '../theme/crudStyles';

const BACKGROUND_IMAGE = require('../assets/wine-cellar-573833.jpg');

/**
 * Componente para el formulario de compras, utilizado para añadir y editar compras.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {function} props.onClose - Función a llamar cuando se cierra el modal.
 * @param {function} props.onSave - Función a llamar para guardar la compra.
 * @param {object} props.purchase - El objeto compra a editar. Nulo para una nueva compra.
 * @param {object} props.theme - El objeto de tema para el estilo.
 * @returns {JSX.Element}
 */
const PurchaseForm = ({ visible, onClose, onSave, purchase, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [proveedor, setProveedor] = useState('');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [showSuppliersList, setShowSuppliersList] = useState(false);

  const totalImporte = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  /**
   * Efecto para poblar el formulario cuando se selecciona una compra para editar.
   */
  useEffect(() => {
    if (purchase) {
      setProveedor(purchase.proveedor || '');
      setItems(purchase.items || []);
    } else {
      setProveedor('');
      setItems([]);
    }
  }, [purchase]);

  /**
   * Carga la lista de proveedores desde Firestore y la mantiene en tiempo real.
   */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "proveedores"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(data);
      setLoadingSuppliers(false);
    }, (error) => {
      // En caso de error, indicamos que la carga terminó y notificamos al formulario
      setLoadingSuppliers(false);
      console.error('Error loading suppliers:', error);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Añade un nuevo item a la lista de productos de la compra.
   */
  const handleAddItem = () => {
    if (itemName && itemPrice) {
      const price = parseFloat(itemPrice);
      if (price > 0) {
        setItems([...items, { name: itemName, price }]);
        setItemName('');
        setItemPrice('');
      } else {
        onSave({ error: t('purchases.positivePriceRequired') });
      }
    } else {
      onSave({ error: t('purchases.itemNameAndPriceRequired') });
    }
  };

  /**
   * Elimina un item de la lista de productos.
   * @param {number} indexToRemove - El índice del item a eliminar.
   */
  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Maneja el guardado de los datos de la compra.
   */
  const handleSave = () => {
    onSave({ proveedor, items, importe: totalImporte });
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
                <Text style={styles.modalTitleText}>{purchase ? t('purchases.editPurchase') : t('purchases.addPurchase')}</Text>
                <TouchableOpacity onPress={onClose}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <ScrollView>
                <Text style={styles.formLabel}>{t('purchases.supplier')}</Text>
                {/* Selector de proveedores: botón con flecha que despliega lista vertical */}
                {loadingSuppliers ? (
                  <View style={{height: 50, justifyContent: 'center'}}>
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      onPress={() => setShowSuppliersList(!showSuppliersList)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: theme.background,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <Text style={{ color: theme.text }}>{proveedor || t('purchases.selectSupplier')}</Text>
                      <FontAwesome name={showSuppliersList ? 'chevron-up' : 'chevron-down'} size={18} color={theme.text} />
                    </TouchableOpacity>

                    {showSuppliersList && (
                      <View style={{ maxHeight: 220, marginTop: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
                        {suppliers.length === 0 ? (
                          <View style={{ padding: 12 }}><Text style={{ color: theme.text }}>{t('purchases.selectSupplier')}</Text></View>
                        ) : (
                          <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 220 }}>
                            {suppliers.map((item, idx) => (
                              <TouchableOpacity
                                key={item.id}
                                onPress={() => { setProveedor(item.name); setShowSuppliersList(false); }}
                                style={{ paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: idx === suppliers.length - 1 ? 0 : 1, borderBottomColor: theme.border }}
                              >
                                <Text style={{ color: theme.text }}>{item.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.formLabel}>{t('purchases.products')}</Text>
                <View style={styles.formSection}>
                    {items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemText}>{item.name} (${item.price.toFixed(2)})</Text>
                        <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                        <FontAwesome name="trash" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                    ))}
                    <View style={styles.addItemContainer}>
                        <TextInput style={[styles.formInput, {flex: 2, marginRight: 8}]} placeholder={t('purchases.productName')} value={itemName} onChangeText={setItemName} placeholderTextColor={theme.text} />
                        <TextInput style={[styles.formInput, {flex: 1}]} placeholder={t('purchases.price')} keyboardType="numeric" value={itemPrice} onChangeText={setItemPrice} placeholderTextColor={theme.text} />
                        <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                            <FontAwesome name="plus" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('purchases.totalAmount')}</Text>
                    <Text style={styles.summaryValue}>${totalImporte.toFixed(2)}</Text>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <FontAwesome name={purchase ? 'save' : 'plus'} size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>{purchase ? t('purchases.saveChanges') : t('purchases.addPurchase')}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Componente principal para la gestión de compras.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.navigation - Objeto de navegación.
 * @returns {JSX.Element}
 */
export default function ControlCompras({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = getCrudStyles(theme);

  // Variables de estado
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'today', 'thisWeek', 'thisMonth'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  /**
   * Efecto para obtener las compras y sus items de Firestore en tiempo real.
   */
  useEffect(() => {
    const q = query(collection(db, "compras"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const purchasesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Carga los items de la subcolección para cada compra
      const purchasesWithItemsPromises = purchasesData.map(async (purchase) => {
        const itemsColRef = collection(db, "compras", purchase.id, "items");
        const itemsSnapshot = await getDocs(itemsColRef);
        const items = itemsSnapshot.docs.map(doc => doc.data());
        return { ...purchase, items };
      });

      const purchasesWithItems = await Promise.all(purchasesWithItemsPromises);
      setPurchases(purchasesWithItems);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Muestra una alerta personalizada.
   * @param {string} title - El título de la alerta.
   * @param {string} message - El mensaje de la alerta.
   */
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  /**
   * Maneja la apertura del modal para añadir una nueva compra.
   */
  const handleAdd = () => {
    setSelectedPurchase(null);
    setModalVisible(true);
  };

  /**
   * Manejo seguro del botón 'volver'. Comprueba si la navegación puede hacer 'goBack',
   * y si no, redirige a la pantalla 'Main' (navegador principal / tab navigator).
   */
  const handleGoBack = () => {
    try {
      if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // 'Main' es el nombre del screen que carga el TabNavigator en AppNavigator
        navigation.navigate('Main');
      }
    } catch (err) {
      // En caso de cualquier error, navegamos a Main como fallback
      navigation.navigate('Main');
    }
  };

  /**
   * Maneja la apertura del modal para editar una compra existente.
   * @param {object} purchase - La compra a editar.
   */
  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setModalVisible(true);
  };

  /**
   * Maneja la apertura del modal de confirmación para eliminar una compra.
   * @param {object} purchase - La compra a eliminar.
   */
  const handleDelete = (purchase) => {
    setDeletingPurchase(purchase);
    setIsDeleteModalVisible(true);
  };

  /**
   * Confirma y ejecuta la eliminación de una compra.
   */
  const confirmDelete = async () => {
    if (deletingPurchase) {
      try {
        // La eliminación de subcolecciones debe manejarse por separado si es necesario.
        await deleteDoc(doc(db, "compras", deletingPurchase.id));
        setIsDeleteModalVisible(false);
        setDeletingPurchase(null);
        showAlert(t("purchases.success"), t("purchases.purchaseDeleted"));
      } catch (error) {
        showAlert(t("error"), error.message);
      }
    }
  };

  /**
   * Maneja el guardado de una compra nueva o actualizada en Firestore.
   * @param {object} data - Los datos de la compra a guardar.
   */
  const handleSave = async (data) => {
    if (data.error) {
      showAlert(t("error"), data.error);
      return;
    }

    if (!data.proveedor || data.items.length === 0) {
      showAlert(
        t("purchases.error"),
        t("purchases.supplierAndProductsRequired", { defaultValue: "Supplier and products are required." })
      );
      return;
    }

    try {
      if (selectedPurchase) {
        const batch = writeBatch(db);
        const purchaseRef = doc(db, "compras", selectedPurchase.id);

        // 1. Actualizar el documento principal
        batch.update(purchaseRef, {
          proveedor: data.proveedor,
          importe: data.importe,
        });

        // 2. Eliminar los items antiguos
        const itemsColRef = collection(db, "compras", selectedPurchase.id, "items");
        const oldItemsSnapshot = await getDocs(itemsColRef);
        oldItemsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // 3. Añadir los nuevos items
        for (const item of data.items) {
          const newItemRef = doc(collection(purchaseRef, "items"));
          batch.set(newItemRef, item);
        }

        await batch.commit();
        showAlert(t("purchases.success"), t("purchases.purchaseUpdated"));

      } else {
        // Proceso para crear una nueva compra con subcolección de items usando un batch.
        const batch = writeBatch(db);
        const newPurchaseRef = doc(collection(db, "compras"));
        
        const mainPurchaseData = {
          proveedor: data.proveedor,
          importe: data.importe,
          fecha: serverTimestamp(),
        };

        batch.set(newPurchaseRef, mainPurchaseData);

        for (const item of data.items) {
          const newItemRef = doc(collection(newPurchaseRef, "items"));
          batch.set(newItemRef, item);
        }

        await batch.commit();
        showAlert(t("purchases.success"), t("purchases.purchaseAdded"));
      }
      setModalVisible(false);
      setSelectedPurchase(null);
    } catch (error) {
      showAlert(t("error"), error.message);
    }
  };

  /**
   * Filtra las compras en función de la consulta de búsqueda.
   */
  const filteredPurchases = purchases.filter(p => {
    const searchMatch = p.proveedor.toLowerCase().includes(searchQuery.toLowerCase());

    const minAmountMatch = minAmount ? p.importe >= parseFloat(minAmount) : true;
    const maxAmountMatch = maxAmount ? p.importe <= parseFloat(maxAmount) : true;

    if (filterPeriod === 'all') {
      return searchMatch && minAmountMatch && maxAmountMatch;
    }

    const purchaseDate = p.fecha?.toDate ? p.fecha.toDate() : null;
    if (!purchaseDate) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filterPeriod) {
      case 'today':
        return searchMatch && purchaseDate >= today && minAmountMatch && maxAmountMatch;
      case 'thisWeek':
        return searchMatch && purchaseDate >= weekStart && minAmountMatch && maxAmountMatch;
      case 'thisMonth':
        return searchMatch && purchaseDate >= monthStart && minAmountMatch && maxAmountMatch;
      default:
        return searchMatch && minAmountMatch && maxAmountMatch;
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme.isDarkMode ? "light-content" : "dark-content"} />
      <View style={{flex: 1, backgroundColor: theme.background}}>
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}><Ionicons name="arrow-back" size={28} color={theme.primary} /></TouchableOpacity>
            <Text style={{...styles.headerTitle, color: theme.text}}>{t('purchases.title')}</Text>
            <TouchableOpacity onPress={handleAdd}><Ionicons name="add" size={32} color={theme.primary} /></TouchableOpacity>
          </View>
          {/* Búsqueda y controles */}
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder={t('purchases.search')} placeholderTextColor={theme.text} value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
              <FontAwesome name="filter" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {/* Lista de compras */}
          <FlatList 
            data={filteredPurchases} 
            renderItem={({item}) => <PurchaseItem item={item} onEdit={handleEdit} onDelete={handleDelete} theme={theme} />} 
            keyExtractor={item => item.id} 
            contentContainerStyle={styles.listContainer} 
          />
        </View>

      {/* Modal para añadir/editar compra */}
      <PurchaseForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSave} 
        purchase={selectedPurchase} 
        theme={theme} 
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>{t('purchases.filter_title')}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.formLabel}>{t('purchases.min_amount_label')}</Text>
              <TextInput placeholder="0.00" value={minAmount} onChangeText={setMinAmount} style={styles.formInput} keyboardType="decimal-pad" placeholderTextColor={theme.text} />

              <Text style={styles.formLabel}>{t('purchases.max_amount_label')}</Text>
              <TextInput placeholder="1000.00" value={maxAmount} onChangeText={setMaxAmount} style={styles.formInput} keyboardType="decimal-pad" placeholderTextColor={theme.text} />
            </ScrollView>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => { setMinAmount(''); setMaxAmount(''); setFilterModalVisible(false); }}>
                <Text style={[styles.buttonText, {color: theme.text}]}>{t('purchases.clear_filters_button')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.buttonText}>{t('purchases.apply_filters_button')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal visible={isDeleteModalVisible} onRequestClose={() => setIsDeleteModalVisible(false)} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>{t('purchases.confirmDeletion')}</Text>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}><FontAwesome name="times-circle" size={30} color={theme.text} /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.deleteIconContainer}><FontAwesome name="exclamation-triangle" size={50} color={theme.primary} /></View>
              <Text style={styles.deleteQuestion}>{t('purchases.confirmDeleteMessage')}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: theme.text}]}>{t('purchases.cancel')}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}><Text style={styles.buttonText}>{t('purchases.delete')}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alerta personalizada */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

/**
 * Componente para renderizar un único elemento de compra en la lista.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.item - Los datos del elemento compra.
 * @param {function} props.onEdit - Función a llamar para editar la compra.
 * @param {function} props.onDelete - Función a llamar para eliminar la compra.
 * @param {object} props.theme - El objeto de tema para el estilo.
 * @returns {JSX.Element}
 */
const PurchaseItem = ({ item, onEdit, onDelete, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [expanded, setExpanded] = useState(false);
  const date = item.fecha?.toDate ? item.fecha.toDate().toLocaleDateString() : 'N/A';

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.proveedor}</Text>
            <Text style={styles.cardInfo}><FontAwesome name="calendar" /> {date}</Text>
            <Text style={styles.cardAmount}>${(item.importe || 0).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
      {expanded && (
        <>
          <View style={styles.expandedContent}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {item.items && item.items.map((purchaseItem, index) => (
                <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>{purchaseItem.name}</Text>
                <Text style={styles.itemText}>${(purchaseItem.price || 0).toFixed(2)}</Text>
                </View>
            ))}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                <FontAwesome name="pencil" size={20} color={theme.text} />
                <Text style={styles.actionButtonText}>{t('purchases.editPurchase')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}>
                <FontAwesome name="trash" size={20} color={theme.primary} />
                <Text style={{...styles.actionButtonText, color: theme.primary}}>{t('purchases.delete')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
