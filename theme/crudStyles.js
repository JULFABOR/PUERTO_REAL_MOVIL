import { StyleSheet, Platform, StatusBar } from 'react-native';

export const getCrudStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontFamily: 'Roboto-Bold', fontSize: 22, color: theme.card, flex: 1, textAlign: 'center' },
  backButton: { position: 'absolute', left: 20, zIndex: 1 },
  addButton: { position: 'absolute', right: 20, zIndex: 1 },
  controlsContainer: { paddingHorizontal: 20, marginVertical: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 10, paddingHorizontal: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45, fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.text },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  
  // Card Styles
  card: { 
    backgroundColor: theme.card, 
    borderRadius: 15, 
    marginBottom: 15, 
    padding: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 5 
  },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Roboto-Bold', fontSize: 18, color: theme.text, marginBottom: 5 },
  cardSubtitle: { fontFamily: 'Roboto-Regular', fontSize: 14, color: theme.text, opacity: 0.7, marginBottom: 10, fontStyle: 'italic' },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { fontFamily: 'Roboto-Regular', fontSize: 14, color: theme.text, marginBottom: 4, opacity: 0.8 },
  cardAmount: { fontFamily: 'Roboto-Bold', fontSize: 18, color: theme.primary, marginTop: 8 },
  cardPrice: { fontFamily: 'Roboto-Bold', fontSize: 16, color: theme.primary },
  cardActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    borderTopWidth: 1, 
    borderTopColor: theme.border, 
    paddingTop: 15, 
    marginTop: 15 
  },
  actionButton: { 
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButtonText: {
    marginLeft: 10,
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: theme.text
  },
  cardImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },

  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  itemsTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: theme.text,
    marginBottom: 5,
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: theme.card, borderRadius: 15, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10, marginBottom: 15 },
  modalTitleText: { fontFamily: 'Roboto-Bold', fontSize: 22, color: theme.text },
  modalBody: { flexShrink: 1, width: '100%' },
  primaryButton: { flexDirection: 'row', backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold', marginLeft: 10 },
  
  // Delete Modal Styles
  deleteIconContainer: { alignItems: 'center', marginVertical: 20 },
  deleteQuestion: { fontFamily: 'Roboto-Bold', fontSize: 18, color: theme.text, textAlign: 'center', marginBottom: 10 },
  deleteInfo: { fontFamily: 'Roboto-Regular', fontSize: 14, color: theme.text, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { backgroundColor: theme.border, marginRight: 10 },
  deleteButton: { backgroundColor: theme.primary },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Roboto-Bold' },

  // Form Styles
  formLabel: { fontFamily: 'Roboto-Bold', fontSize: 16, color: theme.text, marginBottom: 8, marginTop: 10 },
  formInput: { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 15, fontSize: 16, color: theme.text, marginBottom: 15, height: 50 },
  formSection: { backgroundColor: theme.background, borderRadius: 10, padding: 15, marginBottom: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  itemText: { fontFamily: 'Roboto-Regular', fontSize: 16, color: theme.text },
  addItemContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addItemButton: { backgroundColor: theme.primary, borderRadius: 8, padding: 10, marginLeft: 8, height: 45, justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: theme.border },
  summaryLabel: { fontFamily: 'Roboto-Regular', fontSize: 18, color: theme.text },
  summaryValue: { fontFamily: 'Roboto-Bold', fontSize: 20, color: theme.primary },

  // Profile Picture
  profilePicContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
});
