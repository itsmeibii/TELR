import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions, ScrollView, Modal, StatusBar, ImageBackground, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import BalanceCard from '../components/BalanceCard';
import { TransactionPreview } from '../components/TransactionPreview';
import BudgetOverview from '../components/BudgetOverview';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import TransactionModal from './TransactionModal';
import * as firebase from '../assets/Firebase';
import { LinearGradient } from 'expo-linear-gradient';
import PlaidTransactionsModal from '../components/PlaidTransactionsModal';
import TransactionsListModal from '../components/TransactionsListModal';

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

const Home = ({ navigation, transactions, setTransactions, addTransaction }) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [plaidModalVisible, setPlaidModalVisible] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [weeklyIncome, setWeeklyIncome] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState(0);
  const [greeting, setGreeting] = useState('Good day');
  const [userName, setUserName] = useState('');
  
  // Get user data and set greeting
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = firebase.auth.currentUser;
      if (user) {
        const profile = await firebase.getUserProfile(user.uid);
        if (profile && profile.name) {
          setUserName(profile.name.split(' ')[0]); // Get first name
        } else {
          setUserName('');
        }
      }
    };
    
    getCurrentUser();
    
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours >= 12 && hours < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  
  const deleteTransaction = async (id) => {
    try {
      await firebase.deleteFBTransaction(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      console.log('Transaction deleted');
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
    }
  };

  const refresh = async () => {
    try {
      let data = await firebase.getAllTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error refreshing transactions:", error.message);
    }
  };

  useEffect(() => {
    calculateBalances();
  }, [transactions]);

  const calculateBalances = () => {
    if (!transactions || transactions.length === 0) {
      setTotalBalance(0);
      setWeeklyIncome(0);
      setWeeklyExpenses(0);
      return;
    }

    // Calculate total balance
    let balance = 0;
    let income = 0;
    let expenses = 0;

    // Get the current date
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    transactions.forEach(transaction => {
      // Parse transaction date (format: DD/MM/YY)
      const [day, month, year] = transaction.date.split('/').map(Number);
      const transactionDate = new Date(2000 + year, month - 1, day);
      
      // Update total balance
      if (transaction.type === 'income') {
        balance += transaction.amount;
        
        // Update weekly income
        if (transactionDate >= oneWeekAgo) {
          income += transaction.amount;
        }
      } else {
        // For expenses, subtract from balance unless it's a refund
        if (!transaction.isRefund) {
          balance -= transaction.amount;
        }
        
        // Update weekly expenses
        if (transactionDate >= oneWeekAgo) {
          expenses += transaction.amount;
        }
      }
    });

    setTotalBalance(balance);
    setWeeklyIncome(income);
    setWeeklyExpenses(expenses);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Background pattern */}
      <ImageBackground 
        source={require('../assets/money-pattern.png')} 
        style={styles.backgroundPattern}
        imageStyle={{ opacity: 0.05 }}
      >
        {/* Header with greeting */}
        <LinearGradient
          colors={['rgba(237, 187, 104, 0.7)', 'rgba(237, 187, 104, 0.2)', 'transparent']}
          style={styles.greetingBanner}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingTextContainer}>
              {userName ? (
                <>
                  <Text style={styles.greeting}>{greeting},</Text>
                  <Text style={styles.username}>{userName}</Text>
                </>
              ) : (
                <Text style={styles.greeting}>{greeting}!</Text>
              )}
            </View>
            <View style={styles.iconContainer}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Statistics')}
              >
                <Ionicons name="ios-stats-chart" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <BalanceCard
            totalBalance={totalBalance}
            weeklyIncome={weeklyIncome}
            weeklyExpenses={weeklyExpenses}
            transactions={transactions}
            onPress={() => {}} // Add functionality if needed
          />
          
          <BudgetOverview transactions={transactions} />
          
          <TransactionPreview
            SeeAll={() => setListModalVisible(true)}
            transactions={transactions?.slice(0, 5)}
            deleteTransaction={deleteTransaction}
            refresh={refresh}
          />
        </ScrollView>
        
        {/* Floating action button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <LinearGradient
            colors={[COLORS.primary, '#F2CC8F']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <AntDesign name="plus" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </ImageBackground>

      {/* Modals */}
      <TransactionModal
        visible={addModalVisible}
        onClose={() => {setAddModalVisible(false); console.log('pressed')}}
        addTransaction={addTransaction}
      />

      <TransactionsListModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
        refresh={refresh}
      />

      <PlaidTransactionsModal
        visible={plaidModalVisible}
        onClose={() => setPlaidModalVisible(false)}
        addTransaction={addTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundPattern: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  greetingBanner: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 25,
    paddingHorizontal: 24,
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTextContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradientButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;