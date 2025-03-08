import { StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesome5, Foundation, Feather } from '@expo/vector-icons';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryArea, VictoryVoronoiContainer } from 'victory-native';
import Transaction from '../components/Transaction';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { FilterModal, filterTransactions } from '../components/FilterModal';
const generateForecastData = (transactions, daysToForecast = 7) => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Calculate daily balances
  const balanceData = [];
  let runningBalance = 0;
  
  sortedTransactions.forEach(transaction => {
    runningBalance += transaction.amount;
    balanceData.push({
      date: new Date(transaction.date),
      balance: runningBalance
    });
  });

  // Calculate trend for forecast
  const recentDays = 14; // Use last 14 days for trend calculation
  const recentBalances = balanceData.slice(-recentDays);
  
  if (recentBalances.length < 2) return { historicalData: balanceData, forecastData: [] };

  // Calculate average daily change
  const dailyChanges = [];
  for (let i = 1; i < recentBalances.length; i++) {
    dailyChanges.push(recentBalances[i].balance - recentBalances[i-1].balance);
  }
  const avgDailyChange = dailyChanges.reduce((a, b) => a + b, 0) / dailyChanges.length;

  // Generate forecast data
  const forecastData = [];
  const lastBalance = balanceData[balanceData.length - 1];
  const lastDate = new Date(lastBalance.date);
  
  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    forecastData.push({
      date: forecastDate,
      balance: lastBalance.balance + (avgDailyChange * i)
    });
  }

  return { historicalData: balanceData, forecastData };
};

const TransactionModal = ({ close, transactions, deleteTransaction, setTransactions, refresh }) => {
  const [search, setSearch] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions || []);
  const [chartData, setChartData] = useState({ historicalData: [], forecastData: [] });
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const [focused, setIsFocused] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
const [activeFilters, setActiveFilters] = useState({
  type: 'all',
  category: 'all',
  startDate: null,
  endDate: null,
});

const handleApplyFilters = (filters) => {
  setActiveFilters(filters);
  const filtered = filterTransactions(transactions, filters);
  setFilteredTransactions(filtered);
};
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
        transaction.title,
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
const categories = [...new Set(transactions.map(t => t.category))];
  
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const { historicalData, forecastData } = generateForecastData(transactions);
      setChartData({ historicalData, forecastData });
    }
  }, [transactions]);

  useEffect(() => {
    if (!search) {
      setFilteredTransactions(transactions || []);
      return;
    }

    const filtered = (transactions || []).filter((transaction) => {
      if (!transaction) return false;

      const searchableProps = [
        transaction.name, 
        transaction.title, 
        transaction.category
      ];

      return searchableProps.some(prop => 
        prop && 
        typeof prop === 'string' && 
        prop.toLowerCase().includes(search.toLowerCase())
      );
    });
    
    setFilteredTransactions(filtered);
  }, [search, transactions]);

  if (!fontsLoaded) {
    return null;
  }

  const bc = focused ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.3)';

  return (
    <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
      <LinearGradient
        colors={['rgba(129, 246, 129, 0.4)', '#ffffff', 'rgba(191, 103, 245, 0.1)']}
        start={{ x: -2, y: -0.3 }}
        end={{ x: 2, y: 1.9 }}
        style={{ position: 'absolute', width: '100%', height: 1300, bottom: 10 }}
      />
      
      {/* Title Section */}
      <View style={styles.titleSection}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.titleText}>My Transactions</Text>
        </View>
        <TouchableOpacity style={{ marginRight: 30 }} onPress={close}>
          <FontAwesome5 name="times" size={20} color="rgba(0,0,0,0.8)" />
        </TouchableOpacity>
      </View>

    

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { borderColor: bc }]}>
          <Foundation
            name="magnifying-glass"
            size={20}
            color="rgba(0,0,0,0.8)"
            style={{ marginLeft: 15 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Transactions..."
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        <TouchableOpacity
  style={[
    styles.filterButton,
    Object.values(activeFilters).some(v => v !== 'all' && v !== null) && {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
  ]}
  onPress={() => setShowFilterModal(true)}
>
  <Feather
    name="filter"
    size={20}
    color={Object.values(activeFilters).some(v => v !== 'all' && v !== null)
      ? 'white'
      : 'black'}
  />
</TouchableOpacity>
      </View>

      {/* Transaction List */}
      <View style={styles.transactionList}>
        <FlatList
          data={filteredTransactions}
          renderItem={({ item, index }) => (
            <Transaction 
              item={item} 
              index={index} 
              deleteTransaction={deleteTransaction} 
              key={item.id}
              refresh = {refresh}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: 10,
            width: '100%',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <FilterModal
  visible={showFilterModal}
  onClose={() => setShowFilterModal(false)}
  onApplyFilters={handleApplyFilters}
  categories={categories}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.8)',
    fontFamily: 'Inter_700Bold',
  },
  chartSection: {
    width: '100%',
    height: 200,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchSection: {
    width: '90%',
    height: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  searchBar: {
    width: '85%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  searchInput: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.8)',
    marginLeft: 15,
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  transactionList: {
    width: '100%',
    height: '85%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});

export default TransactionModal;