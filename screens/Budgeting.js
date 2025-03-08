import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import BudgetSection from '../components/BudgetSection';
import GoalsSection from '../components/GoalsSection';
import CalculatorSection from '../components/CalculatorSection';
import HelpModal from '../components/HelpModal';
import { Feather } from '@expo/vector-icons';

const Budgeting = ({ transactions }) => {
  
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('budget')
  const [showHelp, setShowHelp] = useState(false);

  const tabs = [
    { id: 'budget', label: 'Budget' },
    { id: 'goals', label: 'Goals' },
    { id: 'calculator', label: 'Calculator' }
  ];
  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(242,252,226,0.9)', 'white']}
        style={styles.gradient}
      />
      
      <View style={{ width: '90%', height: '8%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
  <View>
    <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', fontFamily: 'Inter_700Bold', marginLeft: 5 }}>Budgets and Goals🏆</Text>
    <Text style={{ color: 'rgba(0,0,0,0.3)', marginLeft: 5, fontSize: 16 }}>Plan your dreams, track your progress!</Text>
  </View>
  <TouchableOpacity 
    style={{ padding: 10 }}
    onPress={() => setShowHelp(true)}
  >
    <Feather name="help-circle" size={24} color="#666" />
  </TouchableOpacity>
</View>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'budget' && <BudgetSection transactions={transactions} />}
        {activeTab === 'goals' && <GoalsSection transactions={transactions} />}
        {activeTab === 'calculator' && <CalculatorSection transactions={transactions} />}
      </ScrollView>
      <HelpModal
  isVisible={showHelp}
  onClose={() => setShowHelp(false)}
  title="How to Use Budgets & Goals"
  content={
    <View>
      <Text style={styles.helpText}>• Switch between Budget, Goals, and Calculator tabs</Text>
      <Text style={styles.helpText}>• Set and track monthly budgets for different categories</Text>
      <Text style={styles.helpText}>• Create and monitor savings goals</Text>
      <Text style={styles.helpText}>• Use the calculator for quick financial calculations</Text>
      <Text style={styles.helpText}>• Update your progress regularly to stay on track</Text>
    </View>
  }
/>
    </View>
  );
};

const styles = StyleSheet.create({
  helpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgb(242,252,226)',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1200,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeTab: {
    backgroundColor: 'white',
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
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
    
    
  },
});

export default Budgeting;