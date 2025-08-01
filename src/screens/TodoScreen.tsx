import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Image,
  Alert,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import styles, { CARD_WIDTH, SPACING, MARGIN_HORIZONTAL } from './TodoScreen.styles';

interface CardItem {
  id: string;
  color?: string;
  text?: string;
  title?: string;
  subtitle?: string;
  screenName?: string;
  image?: string;
}

interface TodoScreenProps {
  navigation: {
    navigate: (screenName: string) => void;
  };
}

const TodoScreen: React.FC<TodoScreenProps> = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calcula la altura segura para el StatusBar
  const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20;

  const demoImages = [
    'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
    'https://cdn-icons-png.flaticon.com/128/4606/4606919.png',
    'https://cdn-icons-png.flaticon.com/128/805/805680.png',
    'https://cdn-icons-png.flaticon.com/128/1048/1048333.png',
    'https://cdn-icons-png.flaticon.com/128/1133/1133816.png',
    'https://cdn-icons-png.flaticon.com/128/11133/11133672.png'
  ];

  const originalCards: CardItem[] = [
    { id: '1', title: 'Profile', subtitle: 'Autobus \n Datos  ', color: '#13d6b2', screenName: 'Profile', image: demoImages[3] },
    { id: '2', title: 'Daily', subtitle: 'Actividades \n Diarias', color: '#db07de', screenName: 'Daily', image: demoImages[0] },
    { id: '3', title: 'Preventive', subtitle: 'Mantenimiento preventivo', color: '#1abc09', screenName: 'Preventive', image: demoImages[1] },
    { id: '4', title: 'Maintenance', subtitle: 'Mantenimiento \n General ', color: '#ebda0c', screenName: 'General', image: demoImages[5] },
    { id: '5', title: 'Emergency', subtitle: 'Emergencia \n En Via', color: '#FF5252', screenName: 'Emergency', image: demoImages[2] },
    { id: '6', title: 'Route', subtitle: '  Rutas \n  recorridos', color: '#810dee', screenName: 'Route', image: demoImages[4] },
  ];

  const cards = [
    ...originalCards.slice(-1).map(card => ({ ...card, id: `pre-${card.id}` })),
    ...originalCards,
    ...originalCards.slice(0, 1).map(card => ({ ...card, id: `post-${card.id}` })),
  ];

  const totalCards = originalCards.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: CARD_WIDTH + SPACING * 2,
          animated: false,
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING * 2));
    
    if (index >= cards.length - 1) {
      scrollViewRef.current?.scrollTo({ x: CARD_WIDTH + SPACING * 2, animated: false });
    } else if (index <= 0) {
      scrollViewRef.current?.scrollTo({ x: (CARD_WIDTH + SPACING * 2) * (cards.length - 2), animated: false });
    }

    const adjustedIndex = (index - 1 + totalCards) % totalCards;
    setCurrentIndex(adjustedIndex);

    Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })(event);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING * 2));
    const adjustedIndex = (index - 1 + totalCards) % totalCards;
    setCurrentIndex(adjustedIndex);
  };

  const handleCardPress = (screenName: string | undefined) => {
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <>
      {/* StatusBar transparente */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient 
        colors={['#020c6d', '#3446f5', '#040447']}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={[styles.containerGlobal, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
      >
        <TouchableOpacity 
          style={[styles.backButton, { top: STATUS_BAR_HEIGHT }]} 
          onPress={() => navigation.navigate('Welcome')}
        >
          <AntDesign name="doubleleft" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.content}> 
          <Text style={styles.title}>Documenta la Historia</Text>
        </View>
        
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            decelerationRate={Platform.OS === 'ios' ? 0.99 : 0.95}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING * 2}
            contentContainerStyle={styles.scrollContainer}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            alwaysBounceHorizontal={false}
            bounces={false}
            overScrollMode="never"
          >
            {cards.map((card, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + SPACING * 2),
                index * (CARD_WIDTH + SPACING * 2),
                (index + 1) * (CARD_WIDTH + SPACING * 2),
              ];
              const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 0.9, 0.8], extrapolate: 'clamp' });
              const opacity = scrollX.interpolate({ inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp' });

              return (
                <TouchableOpacity key={card.id} activeOpacity={0.8} onPress={() => handleCardPress(card.screenName)}>
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        width: CARD_WIDTH,
                        backgroundColor: card.color,
                        transform: [{ scale }],
                        opacity,
                        marginLeft: index === 0 ? MARGIN_HORIZONTAL : SPACING,
                        marginRight: index === cards.length - 1 ? MARGIN_HORIZONTAL : SPACING,
                      },
                    ]}
                  >
                    {card.image && <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="contain" />}
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.pagination}>
            {originalCards.map((_, index) => (
              <View key={index} style={[ styles.paginationDot, currentIndex === index && styles.paginationDotActive ]} />
            ))}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

export default TodoScreen;