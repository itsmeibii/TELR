import { StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList, Modal, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, Foundation, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Transaction from './Transaction';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { FilterModal, filterTransactions } from './FilterModal';

// Color theme constants
const COLORS = {
  primary: '#EDBB68',
  secondary: '#4A90E2',
  accent: '#50C878',
  background: '#F8F9FA',
  text: '#2E3842',
  lightText: '#6B7280',
  success: '#16A34A',
  error: '#DC2626',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

const TransactionsListModal = ({ visible, onClose, transactions, deleteTransaction, refresh }) => {
  const [search, setSearch] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions || []);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: null,
    endDate: null,
  });
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Reset search when modal is opened
  useEffect(() => {
    if (visible) {
      setSearch('');
      setActiveFilters({
        type: 'all',
        category: 'all',
        startDate: null,
        endDate: null,
      });
    }
  }, [visible]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions || [];
    
    // Apply filters first
    filtered = filterTransactions(filtered, activeFilters);
    
    // Then apply search
    if (search) {
      filtered = filtered.filter((transaction) => {
        if (!transaction) return false;

        const searchableProps = [
          transaction.name,
          transaction.category
        ];

        return searchableProps.some(prop =>
          prop &&
          typeof prop === 'string' &&
          prop.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    
    setFilteredTransactions(filtered);
  }, [search, transactions, activeFilters]);

  const categories = [...new Set((transactions || []).map(t => t.category))];
  
  // Handle filter application
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  if (!fontsLoaded || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.background, COLORS.white, COLORS.background]}
          style={styles.gradient}
        />
        
        {/* Header with title and close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Transactions</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Foundation
              name="magnifying-glass"
              size={20}
              color={COLORS.text}
              style={{ marginLeft: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              Object.values(activeFilters).some(v => v !== 'all' && v !== null) && styles.activeFilterButton
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Feather
              name="filter"
              size={20}
              color={Object.values(activeFilters).some(v => v !== 'all' && v !== null) ? COLORS.white : COLORS.text}
            />
          </TouchableOpacity>
        </View>
        
        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={({ item, index }) => (
            <Transaction 
              item={item} 
              index={index} 
              deleteTransaction={deleteTransaction}
              refresh={refresh}
              key={item.id || index}
            />
          )}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-search-outline" size={50} color={COLORS.lightText} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
        
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          categories={categories}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 50 : 20,
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.lightText,
  },
});

export default TransactionsListModal;