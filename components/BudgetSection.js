import {setBudgets, getBudgets} from '../assets/Firebase';
import * as firebase from '../assets/Firebase';
import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 TextInput,
 Platform,
 Alert,
 KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import ReactNativeModal from 'react-native-modal';
const CHART_COLORS = {
  Food: '#FF6B6B',
  Groceries: '#4ECDC4',
  Bills: '#45B7D1',
  Misc: '#96CEB4',
  Donations: '#FFEEAD'
};
const calculateSpending = (category, transactions) => {
  console.log('Category:', category);
  console.log('Transactions:', transactions);
  
  if (!transactions) return 0;
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const filteredTransactions = transactions.filter(t => {
      console.log('Checking transaction:', t);
      console.log('Transaction category matches:', t.category === category);
      console.log('Transaction amount:', t.amount);
      console.log('Transaction date:', t.date);
      
      const [day, month, year] = t.date.split('/').map(Number);
      const transactionDate = new Date(2000 + year, month - 1, day);
      console.log('Parsed date:', transactionDate);
      console.log('Is after start of month:', transactionDate >= startOfMonth);
      
      return t.category === category &&
          !t.refunded &&
          t.amount < 0 &&
          transactionDate >= startOfMonth;
  });
  
  console.log('Filtered transactions:', filteredTransactions);
  
  return filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const BudgetEditModal = ({ visible, onClose, category, currentAmount, onSave }) => {
   const [amount, setAmount] = useState(currentAmount?.toString() || '');
 
   const handleSave = () => {
     const numAmount = parseFloat(amount);
     if (isNaN(numAmount) || numAmount <= 0) {
       Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
       return;
     }
     onSave(category, numAmount);
     onClose();
   };
 
   return (
     <ReactNativeModal
       isVisible={visible}
       onBackdropPress={onClose}
       onSwipeComplete={onClose}
       swipeDirection={['down']}
       style={styles.modal}
       avoidKeyboard={true}
     >
       <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         style={styles.modalContent}
       >
         <View style={styles.modalHeader}>
           <View style={styles.modalIndicator} />
           <Text style={styles.modalTitle}>Edit Budget</Text>
           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
             <Feather name="x" size={24} color="#333" />
           </TouchableOpacity>
         </View>
 
         <View style={styles.modalBody}>
           <Text style={styles.label}>{category}</Text>
           <TextInput
             style={styles.input}
             value={amount}
             onChangeText={setAmount}
             placeholder="Enter budget amount"
             keyboardType="decimal-pad"
             autoFocus
           />
           
           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
             <Text style={styles.saveButtonText}>Save Budget</Text>
           </TouchableOpacity>
         </View>
       </KeyboardAvoidingView>
     </ReactNativeModal>
   );
};

const BudgetSection = ({ transactions }) => {
   const [budgets, setBudgets] = useState([]);
   const [newCategory, setNewCategory] = useState('');
   const [newAmount, setNewAmount] = useState('');
   const [loading, setLoading] = useState(true);
   const [editingCategory, setEditingCategory] = useState(null);

   const handleEditBudget = (category) => {
       const budget = budgets.find(b => b.category === category);
       setEditingCategory({
         category,
         amount: budget?.amount || 0
       });
   };

   const handleSaveBudget = async (category, amount) => {
       await firebase.setBudget(category, amount);
       loadBudgets();
   };
 
   const defaultCategories = [
     'Food',
     'Groceries',
     'Bills',
     'Misc',
     'Donations'
   ];
 
   useEffect(() => {
     loadBudgets();
   }, []);
 
   const loadBudgets = async () => {
     const budgetData = await firebase.getBudgets();
     setBudgets(budgetData);
     setLoading(false);
   };
 
   return (
     <>
       <Animated.View 
         entering={FadeIn.duration(500)}
         style={styles.budgetContainer}
       >
         <View style={styles.card}>
           <Text style={styles.cardTitle}>Monthly Budgets</Text>
           
           {defaultCategories.map((category) => {
 const budget = budgets.find(b => b.category === category);
 const spending = calculateSpending(category, transactions);
 const budgetAmount = budget?.amount || 0;
 const percentage = budgetAmount ? (spending / budgetAmount) * 100 : 0;
 const isOverBudget = percentage > 100;

 return (
   <View key={category} style={styles.budgetRow}>
     <View style={styles.budgetInfo}>
       <Text style={styles.categoryText}>{category}</Text>
       {budgetAmount ? (
         <Text style={styles.amountText}>
           ${spending.toFixed(2)} / ${budgetAmount.toFixed(2)}
         </Text>
       ) : (
         <Text style={[styles.amountText, {color: '#666'}]}>
           No Budget Set
         </Text>
       )}
     </View>
     
     
       <View style={styles.progressBarContainer}>
         <View 
           style={[
             styles.progressBar,
             { 
               width: `${Math.min(percentage, 100)}%`,
               backgroundColor: isOverBudget ? '#EF4444' : CHART_COLORS[category]
             }
           ]} 
         />
       </View>
     
     
     <TouchableOpacity 
       style={styles.editButton}
       onPress={() => handleEditBudget(category)}
     >
       <Text style={styles.editButtonText}>Edit</Text>
     </TouchableOpacity>
   </View>
 );
})}
         </View>
   
         <View style={[styles.card, styles.insightsCard]}>
           <Text style={styles.cardTitle}>Spending Insights</Text>
           <Text style={styles.insightText}>
             {getBudgetInsight(budgets, transactions)}
           </Text>
         </View>
       </Animated.View>

       <BudgetEditModal
         visible={editingCategory !== null}
         onClose={() => setEditingCategory(null)}
         category={editingCategory?.category}
         currentAmount={editingCategory?.amount}
         onSave={handleSaveBudget}
       />
     </>
   );
};
 
const styles = StyleSheet.create({
   budgetContainer: {
     gap: 20,
     
     width: '100%'
   },
   modal: {
       margin: 0,
       justifyContent: 'flex-end',
   },
   modalContent: {
       backgroundColor: 'white',
       borderTopLeftRadius: 20,
       borderTopRightRadius: 20,
       padding: 20,
   },
   modalHeader: {
       alignItems: 'center',
       marginBottom: 20,
       position: 'relative',
   },
   modalIndicator: {
       width: 40,
       height: 4,
       backgroundColor: '#E5E7EB',
       borderRadius: 2,
       marginBottom: 10,
   },
   modalTitle: {
       fontSize: 20,
       fontWeight: '600',
   },
   closeButton: {
       position: 'absolute',
       right: 0,
       top: 0,
   },
   modalBody: {
       padding: 20,
   },
   label: {
       fontSize: 16,
       fontWeight: '500',
       marginBottom: 8,
   },
   input: {
       borderWidth: 1,
       borderColor: '#E5E7EB',
       borderRadius: 8,
       padding: 12,
       fontSize: 16,
       marginBottom: 20,
   },
   saveButton: {
       backgroundColor: '#3B82F6',
       padding: 15,
       borderRadius: 8,
       alignItems: 'center',
   },
   saveButtonText: {
       color: 'white',
       fontSize: 16,
       fontWeight: '600',
   },
   card: {
     backgroundColor: 'white',
     borderRadius: 20,
     padding: 20,
     ...Platform.select({
       ios: {
         shadowColor: 'black',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
       },
       android: {
         elevation: 4,
       },
     }),
   },
   cardTitle: {
     fontSize: 20,
     fontWeight: '600',
     marginBottom: 20,
   },
   budgetRow: {
     marginBottom: 15,
   },
   budgetInfo: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: 5,
   },
   categoryText: {
     fontSize: 16,
     fontWeight: '500',
   },
   amountText: {
     fontSize: 16,
     color: '#666',
   },
   progressBarContainer: {
     height: 8,
     backgroundColor: '#E5E7EB',
     borderRadius: 4,
     overflow: 'hidden',
     marginBottom: 5,
   },
   progressBar: {
     height: '100%',
     borderRadius: 4,
   },
   editButton: {
     alignSelf: 'flex-end',
   },
   editButtonText: {
     color: '#3B82F6',
     fontSize: 14,
   },
   insightsCard: {
     marginTop: 20,
   },
   insightText: {
     fontSize: 16,
     color: '#666',
     lineHeight: 24,
   },
});

const getBudgetInsight = (budgets, transactions) => {
   const overBudgetCategories = budgets
     .filter(budget => {
       const spending = calculateSpending(budget.category, transactions);
       return spending > budget.amount;
     })
     .map(b => b.category);
 
   if (overBudgetCategories.length === 0) {
     return "You're staying within your budgets! Keep up the good work! 🎉";
   }
 
   return `Watch out, you're over budget in ${overBudgetCategories.join(', ')}! Try using household appliances less, cancel unused subscrptions, and monitor unnecessary water usage.`;
};

export default BudgetSection;