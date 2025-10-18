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
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

import Home from '../screens/Home';
import Analisis from '../screens/Analisis';
import UserDashboard from '../screens/UserDashboard';

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 65;
const TAB_BAR_MARGIN_H = 25;
const FONT_FAMILY = 'Lato-Bold';

const { width, height: screenHeight } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN_H * 2;

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme, tabBarPosition, setTabBarPosition } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const TOP_POSITION = insets.top + 10;
  const BOTTOM_POSITION = screenHeight - TAB_BAR_HEIGHT - insets.bottom - 20;

  const initialPosition = tabBarPosition === 'top' ? TOP_POSITION : BOTTOM_POSITION;
  const translateY = useRef(new Animated.Value(initialPosition)).current;
  const lastPosition = useRef(initialPosition);

  const onGestureEvent = (event) => {
    const { translationY } = event.nativeEvent;
    translateY.setValue(lastPosition.current + translationY);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      const currentPosition = lastPosition.current + translationY;

      const snapPoint = currentPosition + 0.2 * velocityY;
      const finalDest = snapPoint < screenHeight / 2 ? TOP_POSITION : BOTTOM_POSITION;

      setTabBarPosition(finalDest === TOP_POSITION ? 'top' : 'bottom');
      lastPosition.current = finalDest;
      
      Animated.spring(translateY, {
        toValue: finalDest,
        velocity: velocityY,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const { routes, index: activeIndex } = state;
  const tabWidth = TAB_BAR_WIDTH / routes.length;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: false,
    }).start();

    routes.forEach((_, i) => {
      Animated.timing(textAnim[i], {
        toValue: i === activeIndex ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[getStyles(theme).tabBarContainer, { transform: [{ translateY }] }]}>
        <Animated.View style={[getStyles(theme).activeTab, { left: slideAnim, width: tabWidth }]} />
        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = activeIndex === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = () => {
            if (route.name === 'Home') return isFocused ? 'home' : 'home-outline';
            if (route.name === 'Analisis') return isFocused ? 'analytics' : 'analytics-outline';
            if (route.name === 'Usuario') return isFocused ? 'person' : 'person-outline';
          };

          const labelWidth = textAnim[index].interpolate({ inputRange: [0, 1], outputRange: [0, 60] });

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={getStyles(theme).tabItem}>
              <View style={getStyles(theme).iconContainer}>
                <Ionicons name={getIconName()} size={26} color={isFocused ? theme.card : theme.text} />
              </View>
              <Animated.View style={{ width: labelWidth, overflow: 'hidden' }}>
                <Text style={getStyles(theme).tabLabel} numberOfLines={1}>{route.name}</Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </PanGestureHandler>
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
    position: 'absolute',
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
    paddingHorizontal: 10,
  },
  tabLabel: {
    color: theme.card,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
  },
});

export default TabNavigator;
