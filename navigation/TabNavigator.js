import React, { useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';

import Home from '../screens/Home';
import Analisis from '../screens/Analisis';
import UserDashboard from '../screens/UserDashboard';

const Tab = createBottomTabNavigator();

// --- Constants for styling ---
const TAB_BAR_HEIGHT = 75;
const TAB_BAR_MARGIN_H = 25;
const TAB_BAR_MARGIN_B = 30;
const FONT_FAMILY = 'Lato-Bold';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN_H * 2;

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { routes, index: activeIndex } = state;
  const tabWidth = TAB_BAR_WIDTH / routes.length;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: false, // Needed for layout animation (left)
    }).start();

    routes.forEach((_, i) => {
      Animated.timing(textAnim[i], {
        toValue: i === activeIndex ? 1 : 0,
        duration: 250,
        useNativeDriver: false, // Needed for layout animation (width)
      }).start();
    });
  }, [activeIndex]);

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View style={[styles.activeTab, { left: slideAnim, width: tabWidth }]} />
      {routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = activeIndex === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIconName = () => {
          if (route.name === 'Home') return isFocused ? 'home' : 'home-outline';
          if (route.name === 'Analisis') return isFocused ? 'analytics' : 'analytics-outline';
          if (route.name === 'Usuario') return isFocused ? 'person' : 'person-outline';
        };

        const labelWidth = textAnim[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 60], // Adjust max width as needed
        });

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
                <Ionicons name={getIconName()} size={26} color={isFocused ? theme.card : theme.text} />
            </View>
            <Animated.View style={{ width: labelWidth, overflow: 'hidden' }}>
              <Text style={styles.tabLabel} numberOfLines={1}>{route.name}</Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Analisis" component={Analisis} />
      <Tab.Screen name="Usuario" component={UserDashboard} />
    </Tab.Navigator>
  );
};

const getStyles = (theme) => StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    backgroundColor: theme.card,
    borderRadius: TAB_BAR_HEIGHT / 2,
    marginHorizontal: TAB_BAR_MARGIN_H,
    marginBottom: TAB_BAR_MARGIN_B,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  activeTab: {
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: TAB_BAR_HEIGHT / 2,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  iconContainer: {
    paddingHorizontal: 10, // Space around the icon
  },
  tabLabel: {
    color: theme.card,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
});

export default TabNavigator;