import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

const CalculatorSection = ({ transactions }) => {
  const [goalAmount, setGoalAmount] = useState('');
  const [timeframe, setTimeframe] = useState('12'); // months
  const [currentSavings, setCurrentSavings] = useState('');
  const [result, setResult] = useState(null);

  const calculateMonthlyExpenses = () => {
    if (!transactions) return 0;
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const monthlyExpenses = transactions
      .filter(t => 
        t.amount < 0 && 
        !t.refunded &&
        new Date(t.date.split('/').reverse().join('-')) >= lastMonth
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return monthlyExpenses;
  };

  const calculateAffordability = () => {
    const goal = parseFloat(goalAmount);
    const months = parseFloat(timeframe);
    const savings = parseFloat(currentSavings) || 0;
    const monthlyExpenses = calculateMonthlyExpenses();

    if (isNaN(goal) || isNaN(months)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers');
      return;
    }

    const remaining = goal - savings;
    const monthlyNeeded = remaining / months;
    const monthlyIncome = monthlyExpenses + (transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) / 6); // Average over 6 months

    const suggestions = [];
    if (monthlyNeeded > monthlyIncome * 0.3) {
      suggestions.push("This goal might be challenging. Consider:");
      suggestions.push("• Extending your timeframe");
      suggestions.push("• Finding additional income sources");
      suggestions.push("• Reducing non-essential expenses");
    }

    // Find top spending categories for potential savings
    const categorySpending = transactions
      .filter(t => t.amount < 0 && !t.refunded)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const topSpendingCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    suggestions.push("\nPotential savings areas:");
    topSpendingCategories.forEach(([category, amount]) => {
      suggestions.push(`• ${category}: $${(amount / 6).toFixed(2)}/month avg.`);
    });

    setResult({
      monthlyNeeded,
      monthlyIncome,
      suggestions,
      feasible: monthlyNeeded <= monthlyIncome * 0.3
    });
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Affordability Calculator</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Amount</Text>
            <TextInput
              style={styles.input}
              value={goalAmount}
              onChangeText={setGoalAmount}
              placeholder="Enter amount"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Savings</Text>
            <TextInput
              style={styles.input}
              value={currentSavings}
              onChangeText={setCurrentSavings}
              placeholder="Enter current savings"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Timeframe (months)</Text>
            <TextInput
              style={styles.input}
              value={timeframe}
              onChangeText={setTimeframe}
              placeholder="Enter months"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={calculateAffordability}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Results</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Monthly Savings Needed</Text>
              <Text style={[
                styles.resultValue,
                { color: result.feasible ? '#10B981' : '#EF4444' }
              ]}>
                ${result.monthlyNeeded.toFixed(2)}
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Monthly Income</Text>
              <Text style={styles.resultValue}>
                ${result.monthlyIncome.toFixed(2)}
              </Text>
            </View>

            <View style={styles.suggestionsContainer}>
              {result.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestion}>
                  {suggestion}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: '#374151',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default CalculatorSection;