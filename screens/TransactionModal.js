import { StyleSheet, Text, TouchableOpacity, View, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import PlaidButton from '../components/PlaidButton';

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

// List of common transaction categories
const CATEGORIES = [
  'Food & Drink',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Health',
  'Education',
  'Personal',
  'Travel',
  'Utilities',
  'Income',
  'Other'
];

const TransactionModal = ({ visible, onClose, addTransaction }) => {
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [errors, setErrors] = useState({});
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  // Reset form fields
  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDate(new Date());
    setType('expense');
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!category.trim()) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Format date as DD/MM/YY
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${
        (date.getMonth() + 1).toString().padStart(2, '0')
      }/${date.getFullYear().toString().slice(2)}`;
      
      // Create transaction object
      const transaction = {
        name,
        amount: parseFloat(amount),
        category,
        date: formattedDate,
        type,
      };
      
      // Call the addTransaction function passed from props
      addTransaction(transaction);
      
      // Reset form and close modal
      resetForm();
      onClose();
    }
  };

  // Handle date change from picker
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${
      (date.getMonth() + 1).toString().padStart(2, '0')
    }/${date.getFullYear()}`;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={[COLORS.background, COLORS.white, COLORS.background]}
          style={styles.gradient}
        />
        
        {/* Header with title and close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          {/* Transaction Type Selection */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.activeTypeButton]}
              onPress={() => setType('expense')}
            >
              <MaterialIcons 
                name="arrow-upward" 
                size={20} 
                color={type === 'expense' ? COLORS.white : COLORS.text} 
              />
              <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>
                Expense
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.activeIncomeButton]}
              onPress={() => setType('income')}
            >
              <MaterialIcons 
                name="arrow-downward" 
                size={20} 
                color={type === 'income' ? COLORS.white : COLORS.text} 
              />
              <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Transaction Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Transaction Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g. Grocery shopping"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={[styles.input, errors.amount && styles.inputError]}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>
          
          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownInput, errors.category && styles.inputError]}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={category ? styles.inputText : styles.placeholderText}>
                {category || 'Select category'}
              </Text>
              <MaterialIcons
                name={showCategoryDropdown ? 'arrow-drop-up' : 'arrow-drop-down'}
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            
            {showCategoryDropdown && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDateForDisplay(date)}</Text>
              <MaterialIcons name="date-range" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Connect Bank with Plaid */}
          <View style={styles.plaidContainer}>
            <Text style={styles.orText}>OR</Text>
            <Text style={styles.plaidText}>Import transactions directly from your bank</Text>
            <View style={styles.plaidButtonWrapper}>
              <PlaidButton close={onClose} onPlaidSuccess={addTransaction} />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formContainer: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  activeTypeButton: {
    backgroundColor: COLORS.error,
  },
  activeIncomeButton: {
    backgroundColor: COLORS.success,
  },
  typeText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  activeTypeText: {
    color: COLORS.white,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 5,
  },
  dropdownInput: {
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  plaidContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  orText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.lightText,
    marginBottom: 10,
  },
  plaidText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  plaidButtonWrapper: {
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionModal;