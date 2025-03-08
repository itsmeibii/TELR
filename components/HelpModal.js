// components/HelpModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

const HelpModal = ({ isVisible, onClose, title, content }) => {
  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      swipeDirection={['down']}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View style={styles.indicator} />
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {content}
        </View>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    position: 'absolute',
    top: -10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  content: {
    paddingBottom: 20,
  },
});

export default HelpModal;