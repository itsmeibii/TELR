import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const BudgetOverview = ({ transactions }) => {
  // Calculate monthly budget metrics
  const calculateMonthlyMetrics = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactions?.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      return (month - 1) === currentMonth && (2000 + year) === currentYear;
    });

    const monthlyExpenses = monthlyTransactions?.reduce((sum, t) => 
      t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0) || 0;

    const monthlyIncome = monthlyTransactions?.reduce((sum, t) => 
      t.amount > 0 ? sum + t.amount : sum, 0) || 0;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = currentDate.getDate();
    
    const dailyBudget = monthlyIncome > 0 ? 
      ((monthlyIncome - monthlyExpenses) / (daysInMonth - currentDay)).toFixed(2) : 0;

    const budgetStatus = monthlyExpenses / monthlyIncome * 100;
    
    return { monthlyExpenses: monthlyExpenses ?? 0, monthlyIncome: monthlyIncome ?? 0, dailyBudget: dailyBudget ?? 0, budgetStatus: budgetStatus ?? 0 };
  };

  const { monthlyExpenses, monthlyIncome, dailyBudget, budgetStatus } = calculateMonthlyMetrics();

  return (
    <View style={styles.budgetContainer}>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetTitle}>Monthly Budget Status</Text>
      </View>

      <View style={styles.budgetInfo}>
        <View style={styles.budgetRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Budget Used</Text>
            <Text style={[styles.metricValue, 
              { color: budgetStatus > 80 ? '#FF3B30' : 
                       budgetStatus > 60 ? '#FF9500' : '#34C759' }]}>
              {budgetStatus ? budgetStatus.toFixed(1) : '0'}%
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Daily Budget Left</Text>
            <Text style={styles.metricValue}>${dailyBudget}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(budgetStatus, 100)}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  budgetContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
  },
  budgetInfo: {
    gap: 15,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
});

export default BudgetOverview;