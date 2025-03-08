import { StyleSheet, Text, View, Platform, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getAIForecast } from '../assets/forecastUtils';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import HelpModal from './HelpModal';
const formatNumber = (num) => {
  if (num == null) return '0';
  return Number(num.toFixed(2)).toString();
};
const AnimatedView = Animated.createAnimatedComponent(View);
const BalanceCard = ({totalBalance, weeklyIncome, weeklyExpenses, transactions, onPress}) => {
  const [forecast, setForecast] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    console.log('ran')
    const fetchForecast = async () => {
      // console.log(transactions)
      if (transactions && transactions.length > 0) {
        console.log('ran')
        const prediction = await getAIForecast(transactions);
        console.log(prediction);
        setForecast(prediction);
      }
    };
    
    fetchForecast();
  }, [transactions]);

  if (totalBalance == null || weeklyIncome == null || weeklyExpenses == null) {
    return null;
  }

  const predictedBalance = totalBalance + (forecast?.predictedChange || 0);

  return (
    <Pressable style={styles.container} onPress = {onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Balance</Text>
        <TouchableOpacity 
      style={{ padding: 10, position: 'absolute', right: -10, top: -10 }}
      onPress={() => setShowHelp(true)}
    >
      <Feather name="help-circle" size={24} color="#666" />
    </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>${formatNumber(totalBalance)}</Text>
        {forecast && (
  <Animated.View 
    entering={FadeInDown.duration(600).springify()}
    style={[
      styles.forecastContainer,
      { 
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderColor: 'rgba(0,0,0,0.1)',
      }
    ]}
  >
    <View style={styles.headerRow}>
      <Ionicons name='information-circle-outline' size={14} color='#6B7280' style={{marginHorizontal: 3}} />
      <Text style={styles.headerText}>Predicted Forecast</Text>
    </View>
    
    <Text style={styles.subText}>
      Next week:
    </Text>
    
    <View style={styles.forecastWrapper}>
      <Text style={[
        styles.forecast,
        { color: forecast.predictedChange >= 0 ? '#16A34A' : '#DC2626' }
      ]}>
        ${formatNumber(predictedBalance)} {forecast.predictedChange && `(${forecast.predictedChange})`}
      </Text>
    </View>
    <HelpModal
  isVisible={showHelp}
  onClose={() => setShowHelp(false)}
  title="How to Use Home Screen"
  content={
    <View>
      <Text style={styles.helpText}>• View your balance and weekly income/expenses at a glance</Text>
      <Text style={styles.helpText}>• Add new transactions using the + button</Text>
      <Text style={styles.helpText}>• View recent transactions and tap "See All" for full history</Text>
      <Text style={styles.helpText}>• Monitor your budget progress in the overview section</Text>
      <Text style={styles.helpText}>• Tap on any transaction to view details or make changes</Text>
    </View>
  }
/>
  </Animated.View>
)}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.amount, {color: 'green'}]}>+${formatNumber(weeklyIncome)}</Text>
          <Text style={styles.label}>Income</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.amount, {color: 'red'}]}>-${formatNumber(weeklyExpenses)}</Text>
          <Text style={styles.label}>Expenses</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  forecast: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    
  },
  statItem: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  forecastContainer: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
    width: '60%'
  },
  helpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  subText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 1,
  },
  forecast: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastWrapper: {
    alignItems: 'center',
  },
});

export default BalanceCard;