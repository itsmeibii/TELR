import { StyleSheet, Text, View, FlatList, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import React, { useState } from 'react';
import ReactNativeModal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const TransactionItem = ({ item, onSelect, isSelected }) => (
  <TouchableOpacity 
    style={[
      styles.transactionItem,
      isSelected && styles.selectedItem
    ]}
    onPress={() => onSelect(item)}
  >
    <View style={styles.transactionLeft}>
      <Text style={styles.transactionDate}>{item.date}</Text>
      <Text style={styles.transactionName}>{item.name}</Text>
      <Text style={styles.transactionCategory}>{item.category}</Text>
    </View>
    <View style={styles.transactionRight}>
      <Text style={[
        styles.transactionAmount,
        item.amount > 0 ? styles.incomeAmount : styles.expenseAmount
      ]}>
        ${Math.abs(item.amount).toFixed(2)}
      </Text>
      {isSelected && (
        <Feather name="check-circle" size={20} color="#007AFF" style={styles.checkmark} />
      )}
    </View>
  </TouchableOpacity>
);

const PlaidTransactionsModal = ({ isVisible, onClose, transactions, onSubmit }) => {
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const toggleTransactionSelection = (transaction) => {
    setSelectedTransactions(prev => {
      const isCurrentlySelected = prev.some(t => t.name === transaction.name && t.date === transaction.date);
      if (isCurrentlySelected) {
        return prev.filter(t => t.name !== transaction.name || t.date !== transaction.date);
      } else {
        return [...prev, transaction];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedTransactions);
    setSelectedTransactions([]);
    onClose();
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      deviceHeight={height}
      useNativeDriver={true}
      propagateSwipe={true}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View style={styles.indicator} />
          <Text style={styles.headerText}>Import Transactions</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="black" />
          </Pressable>
        </View>

        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <TransactionItem 
              item={item}
              onSelect={toggleTransactionSelection}
              isSelected={selectedTransactions.some(
                t => t.name === item.name && t.date === item.date
              )}
            />
          )}
          keyExtractor={(item, index) => `${item.name}-${item.date}-${index}`}
          style={styles.transactionList}
          initialNumToRender={5}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedTransactions.length === 0 && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={selectedTransactions.length === 0}
          >
            <Text style={styles.submitButtonText}>
              Import {selectedTransactions.length} Transaction{selectedTransactions.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
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
    height: height * 0.8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  transactionList: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#2ecc71',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  checkmark: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlaidTransactionsModal;