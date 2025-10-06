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

const LOW_STOCK_THRESHOLD = 50;

export default function Analisis({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingIndicator theme={theme} />;
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
        <Text style={styles.headerTitle}>Análisis de Inventario</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statsGrid}>
          <StatCard icon="archive" title="Total Productos" value={totalProducts} theme={theme} />
          <StatCard icon="tags" title="Nº Categorías" value={categories.length} theme={theme} />
          <StatCard icon="dollar" title="Valor Inventario" value={`${totalValue.toFixed(2)}`} theme={theme} />
        </View>

        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
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
            ) : <Text style={styles.noDataText}>No hay datos para mostrar el gráfico.</Text>}
        </View>

        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Actividad de la Última Semana</Text>
            <LineChart
                data={{
                    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
                    datasets: [{
                        data: [
                            Math.floor(Math.random() * 50) + 10,
                            Math.floor(Math.random() * 50) + 20,
                            Math.floor(Math.random() * 30) + 15,
                            Math.floor(Math.random() * 60) + 25,
                            Math.floor(Math.random() * 70) + 30,
                            Math.floor(Math.random() * 90) + 40,
                            Math.floor(Math.random() * 80) + 35
                        ]
                    }]
                }}
                width={Dimensions.get("window").width - 70}
                height={220}
                yAxisSuffix={"k"}
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

        <LowStockList products={lowStockProducts} theme={theme} />
      </ScrollView>
    </SafeAreaView>
  );
}

const LoadingIndicator = ({ theme }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Cargando Análisis...</Text>
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

const LowStockList = ({ products, theme }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.lowStockContainer}>
            <Text style={styles.sectionTitle}>Productos con Stock Bajo</Text>
            {products.length > 0 ? (
                products.map(p => (
                    <View key={p.id} style={styles.lowStockItem}>
                        <Text style={styles.lowStockName}>{p.name}</Text>
                        <Text style={styles.lowStockValue}>{p.stock} uds.</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noDataText}>¡Todo el inventario está al día!</Text>
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
