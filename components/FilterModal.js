import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

export const FilterModal = ({ visible, onClose, onApplyFilters, categories = [] }) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      resetFilters();
    }
  }, [visible]);

  const handleCategoryPress = (category) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    
    const newCategories = selectedCategories.filter(cat => cat !== 'all');
    if (newCategories.includes(category)) {
      const updated = newCategories.filter(cat => cat !== category);
      setSelectedCategories(updated.length ? updated : ['all']);
    } else {
      setSelectedCategories([...newCategories, category]);
    }
  };

  const handleDateChange = (event, selectedDate, isStartDate) => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    
    if (selectedDate) {
      if (isStartDate) {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const applyFilters = () => {
    onApplyFilters({
      type: filterType,
      categories: selectedCategories,
      startDate,
      endDate,
    });
    onClose();
  };

  const resetFilters = () => {
    setFilterType('all');
    setSelectedCategories(['all']);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Transaction Type</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'all' && styles.selectedOption,
                ]}
                onPress={() => setFilterType('all')}
              >
                <Text style={filterType === 'all' ? styles.selectedText : null}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'income' && styles.selectedIncomeOption,
                ]}
                onPress={() => setFilterType('income')}
              >
                <Text style={filterType === 'income' ? styles.selectedText : null}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'outcome' && styles.selectedExpenseOption,
                ]}
                onPress={() => setFilterType('outcome')}
              >
                <Text style={filterType === 'outcome' ? styles.selectedText : null}>Expenses</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.categoryOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedCategories.includes('all') && styles.selectedOption,
                ]}
                onPress={() => handleCategoryPress('all')}
              >
                <Text style={selectedCategories.includes('all') ? styles.selectedText : null}>All</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    selectedCategories.includes(category) && styles.selectedOption,
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={selectedCategories.includes(category) ? styles.selectedText : null}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Date Range</Text>
            <View style={styles.dateInputs}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>
                  {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>
                  {endDate ? endDate.toLocaleDateString() : 'End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {(showStartPicker || showEndPicker) && (
            <DateTimePicker
              value={showStartPicker ? (startDate || new Date()) : (endDate || new Date())}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => 
                handleDateChange(event, selectedDate, showStartPicker)
              }
            />
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetFilters}
            >
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedIncomeOption: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  selectedExpenseOption: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  selectedText: {
    color: 'white',
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export const filterTransactions = (transactions, filters) => {
  return transactions.filter(transaction => {
    if (filters.type !== 'all') {
      const isIncome = transaction.amount > 0;
      if (filters.type === 'income' && !isIncome) return false;
      if (filters.type === 'outcome' && isIncome) return false;
    }

    if (filters.categories && !filters.categories.includes('all') && !filters.categories.includes(transaction.category)) {
      return false;
    }

    if (filters.startDate || filters.endDate) {
      const [day, month, year] = transaction.date.split('/');
      const transactionDate = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (filters.startDate && transactionDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && transactionDate > filters.endDate) {
        return false;
      }
    }

    return true;
  });
};