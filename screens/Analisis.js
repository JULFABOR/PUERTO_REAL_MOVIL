import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

const LOW_STOCK_THRESHOLD = 50;

// Helper function to process weekly purchase data
const processWeeklyData = (purchases, t) => {
  const labels = [];
  const data = Array(7).fill(0);
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(t(d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()));
  }

  purchases.forEach(purchase => {
    // Assuming purchase.fecha is a Firebase Timestamp
    if (purchase.fecha && typeof purchase.fecha.toDate === 'function') {
      const purchaseDate = purchase.fecha.toDate();
      const diffTime = today - purchaseDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = 6 - diffDays;
        data[dayIndex] += purchase.importe || 0;
      }
    }
  });

  return { labels, datasets: [{ data }] };
};

export default function Analisis({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      if (loading) setLoading(false); // Set loading to false after first fetch
    });

    const unsubPurchases = onSnapshot(collection(db, "purchases"), (snapshot) => {
      const purchasesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPurchases(purchasesData);
    });

    return () => {
      unsubProducts();
      unsubPurchases();
    };
  }, []);

  if (loading) {
    return <LoadingIndicator theme={theme} t={t} />;
  }

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const categories = [...new Set(products.map(p => p.category))];
  const lowStockProducts = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);

  const categoryStock = categories.map(category => ({
    name: category,
    stock: products.filter(p => p.category === category).reduce((sum, p) => sum + p.stock, 0),
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    legendFontColor: theme.text,
    legendFontSize: 15
  }));

  const weeklyPurchasesData = processWeeklyData(purchases, t);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => theme.text,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: theme.primary,
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('inventoryAnalysis')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statsGrid}>
          <StatCard icon="archive" title={t('totalProducts')} value={totalProducts} theme={theme} />
          <StatCard icon="tags" title={t('numCategories')} value={categories.length} theme={theme} />
          <StatCard icon="dollar" title={t('inventoryValue')} value={`${totalValue.toFixed(2)}`} theme={theme} />
        </View>

        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>{t('categoryDistribution')}</Text>
            {categoryStock.length > 0 ? (
                <PieChart
                    data={categoryStock}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"stock"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    absolute
                />
            ) : <Text style={styles.noDataText}>{t('noDataForChart')}</Text>}
        </View>

        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>{t('lastWeekPurchases')}</Text>
            <LineChart
                data={weeklyPurchasesData}
                width={Dimensions.get("window").width - 70}
                height={220}
                yAxisLabel="$"
                chartConfig={{
                    ...chartConfig,
                    backgroundGradientFrom: theme.primary,
                    backgroundGradientTo: theme.primary,
                    color: (opacity = 1) => theme.card,
                    labelColor: (opacity = 1) => theme.card,
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>

        <LowStockList products={lowStockProducts} theme={theme} t={t} />
      </ScrollView>
    </SafeAreaView>
  );
}

const LoadingIndicator = ({ theme, t }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>{t('loadingAnalysis')}</Text>
        </View>
    );
};

const StatCard = ({ icon, title, value, theme }) => {
    const styles = getStyles(theme);
    return (
      <View style={styles.statCard}>
        <FontAwesome name={icon} size={24} color={theme.primary} />
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    );
};

const LowStockList = ({ products, theme, t }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.lowStockContainer}>
            <Text style={styles.sectionTitle}>{t('lowStockProducts')}</Text>
            {products.length > 0 ? (
                products.map(p => (
                    <View key={p.id} style={styles.lowStockItem}>
                        <Text style={styles.lowStockName}>{p.name}</Text>
                        <Text style={styles.lowStockValue}>{p.stock} {t('units')}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noDataText}>{t('inventoryUpToDate')}</Text>
            )}
        </View>
    );
};

const getStyles = (theme) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: theme.background, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 20, 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: { 
    fontFamily: 'Roboto-Bold', 
    fontSize: 26, 
    color: theme.text 
  },
  scrollContainer: { 
    padding: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.background 
  },
  loadingText: { 
    color: theme.text, 
    marginTop: 10, 
    fontFamily: 'Roboto-Regular' 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25 
  },
  statCard: { 
    backgroundColor: theme.card, 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    width: '32%', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 5 
  },
  statTitle: { 
    fontFamily: 'Roboto-Regular', 
    fontSize: 12, 
    color: theme.text, 
    opacity: 0.7,
    marginTop: 8, 
    marginBottom: 4 
  },
  statValue: { 
    fontFamily: 'Roboto-Bold', 
    fontSize: 18, 
    color: theme.text 
  },
  chartContainer: { 
    backgroundColor: theme.card, 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 25, 
    alignItems: 'center' 
  },
  sectionTitle: { 
    fontFamily: 'Roboto-Bold', 
    fontSize: 18, 
    color: theme.text, 
    marginBottom: 15 
  },
  lowStockContainer: { 
    backgroundColor: theme.card, 
    borderRadius: 15, 
    padding: 15 
  },
  lowStockItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.border 
  },
  lowStockName: { 
    fontFamily: 'Roboto-Regular', 
    fontSize: 15, 
    color: theme.text 
  },
  lowStockValue: { 
    fontFamily: 'Roboto-Bold', 
    fontSize: 15, 
    color: theme.primary 
  },
  noDataText: { 
    textAlign: 'center', 
    padding: 10, 
    fontFamily: 'Roboto-Regular', 
    color: theme.text,
    opacity: 0.6,
  }
});