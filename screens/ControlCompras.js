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
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import CustomAlert from '../components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../theme/ThemeContext';
import { getCrudStyles } from '../theme/crudStyles';

const BACKGROUND_IMAGE = require('../assets/wine-cellar-573833.jpg');

const PurchaseForm = ({ visible, onClose, onSave, purchase, theme }) => {
  const { t } = useTranslation();
  const styles = getCrudStyles(theme);
  const [proveedor, setProveedor] = useState('');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const totalImporte = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  useEffect(() => {
    if (purchase) {
      setProveedor(purchase.proveedor || '');
      setItems(purchase.items || []);
    } else {
      setProveedor('');
      setItems([]);
    }
  }, [purchase]);

  const handleAddItem = () => {
    if (itemName && itemPrice) {
      setItems([...items, { name: itemName, price: parseFloat(itemPrice) }]);
      setItemName('');
      setItemPrice('');
    } else {
      // showAlert or some feedback
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

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
                <TextInput style={styles.formInput} placeholder={t('purchases.selectSupplier')} value={proveedor} onChangeText={setProveedor} placeholderTextColor={theme.text} />

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

export default function ControlCompras({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = getCrudStyles(theme);

  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "compras"), async (snapshot) => {
      const purchasesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleAdd = () => {
    setSelectedPurchase(null);
    setModalVisible(true);
  };

  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setModalVisible(true);
  };

  const handleDelete = (purchase) => {
    setDeletingPurchase(purchase);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingPurchase) {
      try {
        await deleteDoc(doc(db, "compras", deletingPurchase.id));
        setIsDeleteModalVisible(false);
        setDeletingPurchase(null);
        showAlert(t("purchases.success"), t("purchases.purchaseDeleted"));
      } catch (error) {
        showAlert(t("error"), error.message);
      }
    }
  };

  const handleSave = async (data) => {
    if (!data.proveedor || data.items.length === 0) {
      showAlert(t("purchases.error"), t("purchases.supplierAndProductsRequired"));
      return;
    }

    try {
      if (selectedPurchase) {
        // TODO: La lógica de actualización es más compleja con subcolecciones y requiere un tratamiento especial.
        // Por ahora, se actualiza solo el documento principal para evitar errores.
        const purchaseRef = doc(db, "compras", selectedPurchase.id);
        await updateDoc(purchaseRef, {
          proveedor: data.proveedor,
          importe: data.importe,
        });
        showAlert(t("purchases.success"), "Compra actualizada (solo datos principales).");

      } else {
        // Proceso para crear una nueva compra con subcolección de items usando un batch
        const batch = writeBatch(db);

        // 1. Crear una referencia para el nuevo documento de compra para obtener su ID
        const newPurchaseRef = doc(collection(db, "compras"));
        
        // 2. Definir los datos del documento principal
        const mainPurchaseData = {
          proveedor: data.proveedor,
          importe: data.importe,
          fecha: serverTimestamp(),
        };

        // 3. Añadir la operación de creación del documento principal al batch
        batch.set(newPurchaseRef, mainPurchaseData);

        // 4. Añadir cada item como un nuevo documento en la subcolección "items"
        for (const item of data.items) {
          const newItemRef = doc(collection(newPurchaseRef, "items"));
          batch.set(newItemRef, item);
        }

        // 5. Ejecutar todas las operaciones del batch de forma atómica
        await batch.commit();
        showAlert(t("purchases.success"), t("purchases.purchaseAdded"));
      }
      setModalVisible(false);
      setSelectedPurchase(null);
    } catch (error) {
      showAlert(t("error"), error.message);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.proveedor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color={theme.card} /></TouchableOpacity>
            <Text style={styles.headerTitle}>{t('purchases.title')}</Text>
            <TouchableOpacity onPress={handleAdd}><Ionicons name="add" size={32} color={theme.card} /></TouchableOpacity>
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} />
              <TextInput style={styles.searchInput} placeholder={t('purchases.search')} placeholderTextColor={theme.text} value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </View>
          <FlatList 
            data={filteredPurchases} 
            renderItem={({item}) => <PurchaseItem item={item} onEdit={handleEdit} onDelete={handleDelete} theme={theme} />} 
            keyExtractor={item => item.id} 
            contentContainerStyle={styles.listContainer} 
          />
        </View>
      </ImageBackground>

      <PurchaseForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleSave} 
        purchase={selectedPurchase} 
        theme={theme} 
      />

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
              {deletingPurchase && <Text style={styles.deleteInfo}>{t('purchases.recordWillBeDeleted', {code: deletingPurchase.id})}</Text>}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}><Text style={[styles.buttonText, {color: theme.text}]}>{t('purchases.cancel')}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={confirmDelete}><Text style={styles.buttonText}>{t('purchases.delete')}</Text></TouchableOpacity>
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

const PurchaseItem = ({ item, onEdit, onDelete, theme }) => {
  const styles = getCrudStyles(theme);
  const date = item.fecha?.toDate ? item.fecha.toDate().toLocaleDateString() : 'N/A';
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.proveedor}</Text>
        <Text style={styles.cardInfo}><FontAwesome name="calendar" /> {date}</Text>
        <Text style={styles.cardAmount}>${(item.importe || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}><FontAwesome name="pencil" size={20} color={theme.text} /></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}><FontAwesome name="trash" size={20} color={theme.primary} /></TouchableOpacity>
      </View>
    </View>
  );
};