import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraComponent, { CameraComponentRef } from '../components/CameraComponent';
import styles from './RouteScreen.styles';

type JournalEntry = {
  id: string;
  text: string;
  date: Date;
  image?: string;
};

const STORAGE_KEY = '@journal_entries_route';

const RouteScreen = ({ navigation }: any) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraComponentRef>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const saveEntries = async (entriesToSave: JournalEntry[]) => {
    try {
      const jsonValue = JSON.stringify(entriesToSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error guardando entradas:', e);
    }
  };

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const loadedEntries = JSON.parse(jsonValue).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(loadedEntries);
      }
    } catch (e) {
      console.error('Error cargando entradas:', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openCamera = () => setCameraVisible(true);
  const closeCamera = () => setCameraVisible(false);

  const takePicture = async () => {
    if (cameraRef.current) {
      const uri = await cameraRef.current.takePicture();
      if (uri) {
        setSelectedImage(uri);
        closeCamera();
      }
    }
  };

  const addEntry = () => {
    if (!newEntry.trim() && !selectedImage) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      text: newEntry,
      date: new Date(date),
      image: selectedImage || undefined,
    };
    setEntries([entry, ...entries]);
    setNewEntry('');
    setSelectedImage(null);
    setDate(new Date());
  };

  const deleteEntry = (id: string) => {
    Alert.alert('Eliminar entrada', '¿Estás seguro de que quieres borrar este mensaje?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setEntries(entries.filter(entry => entry.id !== id)) },
    ]);
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {item.date.toLocaleDateString()} - {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity onPress={() => deleteEntry(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash" size={20} color="#ff5252" />
        </TouchableOpacity>
      </View>
      {item.image && <Image source={{ uri: item.image }} style={styles.entryImage} />}
      {item.text && <Text style={styles.entryText}>{item.text}</Text>}
      <View style={styles.timelineConnector} />
    </View>
  );

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
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
      
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient 
          colors={['#020c6d', '#3446f5', '#040447']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 0.7 }} 
          style={[styles.container, { 
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
          }]}
        >
          <TouchableOpacity 
            style={[styles.backButton, { 
              top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 20 
            }]} 
            onPress={() => navigation.navigate('Todo')}
          >
            <AntDesign name="doubleleft" size={20} color="white" style={styles.backButtonIcon} />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text style={styles.title}>Mis Rutas</Text>
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={styles.entriesList}
              ListHeaderComponent={<View style={styles.listFooter} />}
            />
            
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={openCamera} style={styles.mediaButton}>
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
                <Ionicons name="image" size={24} color="white" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                value={newEntry}
                onChangeText={setNewEntry}
                placeholder="Escribe tu ruta aquí..."
                placeholderTextColor="#aaa"
                multiline
              />
              
              <TouchableOpacity onPress={addEntry} style={styles.sendButton}>
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={onChangeDate}
            />
          )}
          
          <Modal visible={cameraVisible} animationType="slide">
            <CameraComponent ref={cameraRef} onClose={closeCamera} />
            <TouchableOpacity 
              onPress={takePicture} 
              style={styles.cameraModalButton}
            >
              <Ionicons name="camera" size={50} color="white" />
            </TouchableOpacity>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default RouteScreen;