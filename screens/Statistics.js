import React, { useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { 
    VictoryChart, 
    VictoryLine, 
    VictoryAxis,
    VictoryTooltip,
    VictoryContainer,
    VictoryPie,
    createContainer
  } from 'victory-native';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icons } from '../components/Transaction';
import { Feather } from '@expo/vector-icons';
import HelpModal from '../components/HelpModal';
const TIME_RANGES = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Last 365 Days', value: 365 },
];
const CHART_COLORS = {
    Food: '#FF6B6B',
    Groceries: '#4ECDC4',
    Bills: '#45B7D1',
    Misc: '#96CEB4',
    Donations: '#FFEEAD'
  };
const VictoryVoronoiContainer = createContainer("voronoi");
const ChartContainer = ({ children }) => {
  return (
    <View style={styles.chartContainer}>
      {children}
    </View>
  );
};
const CustomLabel = ({ x, y, datum }) => {
    // Don't show labels for small segments
    if (datum.percentage < 5) return null;
  
    const IconComponent = Icons[datum.x];
    
    return (
      <View style={{
        position: 'absolute',
        left: x - 30, // Center the label
        top: y - 15,  // Center the label
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 4,
        borderRadius: 8,
      }}>
        {IconComponent && <IconComponent income={false} size={[20, 12]} />}
        <Text style={{ fontSize: 10, marginLeft: 2, color: '#333' }}>
          {datum.percentage}%
        </Text>
      </View>
    );
  };

const Statistics = ({ route, transactions }) => {
  const transactionsData = route.params?.transactions || transactions || [];
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [timeRange, setTimeRange] = useState(7);
  const [graphData, setGraphData] = useState([]);
  const [items, setItems] = useState(TIME_RANGES);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Get the date range
    const endDate = moment();
    const startDate = moment().subtract(timeRange, 'days');
  
    // Calculate initial balance before start date
    const initialBalance = transactionsData.reduce((sum, transaction) => {
      const transDate = moment(transaction.date, 'DD/MM/YY');
      if (transDate < startDate && !transaction.refunded) {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);
  
    // Create an object to store daily balances
    const dailyBalances = {};
  
    // Initialize all dates in range with initial balance
    for (let d = moment(startDate); d <= endDate; d = d.clone().add(1, 'days')) {
      dailyBalances[d.format('DD/MM/YY')] = 0;
    }
  
    // Calculate running balance starting from initial balance
    let runningBalance = initialBalance;
    
    // Add each transaction's amount to running balance
    Object.entries(dailyBalances).forEach(([date]) => {
      const dayTransactions = transactionsData.filter(t => 
        t.date === date && !t.refunded
      );
      
      const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      runningBalance += dayTotal;
      dailyBalances[date] = runningBalance;
    });
  
    // Convert to array format for Victory
    const data = Object.entries(dailyBalances).map(([date, balance]) => ({
      x: moment(date, 'DD/MM/YY').toDate(),
      y: balance,
    }));
  
    setGraphData(data);
  }, [transactionsData, timeRange]);
  const calculateExpenseBreakdown = () => {
    if (!transactions) return [];
  
    const endDate = moment();
    const startDate = moment().subtract(timeRange, 'days');
  
    // Filter transactions
    const filteredTransactions = transactionsData.filter(transaction => {
      const transDate = moment(transaction.date, 'DD/MM/YY');
      return transDate >= startDate && 
             transDate <= endDate && 
             transaction.amount < 0 &&
             !transaction.refunded;
    });
  
    // Group by category
    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});
  
    // Calculate total expenses for percentages
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  
    // Format for Victory Pie
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      x: category,
      y: amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1),
      amount: amount.toFixed(2)
    }));
  };
// Convert to array format for Victory


  const renderCategoryIcon = (categoryName) => {
    const IconComponent = Icons[categoryName];
    if (IconComponent) {
      return <IconComponent income={false} size={[35, 18]} />;
    }
    return null;
  };

  const calculateTopSpendingCategories = () => {
    if (!transactions) return [];
  
    // Get date range
    const endDate = moment();
    const startDate = moment().subtract(timeRange, 'days');
  
    // Filter transactions by date range and only include expenses
    const filteredTransactions = transactions.filter(transaction => {
      const transDate = moment(transaction.date, 'DD/MM/YY');
      return transDate >= startDate && 
             transDate <= endDate && 
             transaction.amount < 0 &&
             !transaction.refunded;
    });
  
    // Group by category and sum amounts
    const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});
  
    // Convert to array and sort by amount
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(800).springify()}
      style={[styles.container, { paddingTop: insets.top,  }]}
    >
        <View style={{ width: '100%', height: '8%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
  <View>
    <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', fontFamily: 'Inter_700Bold', marginLeft: 5 }}>Statistics📊</Text>
    <Text style={{ color: 'rgba(0,0,0,0.3)', marginLeft: 5, fontSize: 16 }}>Let's look at your spending habits</Text>
  </View>
  <TouchableOpacity 
    style={{ padding: 10 }}
    onPress={() => setShowHelp(true)}
  >
    <Feather name="help-circle" size={24} color="#666" />
  </TouchableOpacity>
</View>
        <ScrollView style = {{width: '100%', flex: 1}}>
      <View style={styles.card}>
        <Text style={styles.title}>Balance Over Time</Text>
        
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={timeRange}
            items={items}
            setOpen={setOpen}
            setValue={setTimeRange}
            setItems={setItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            listItemContainerStyle={styles.dropdownItem}
          />
        </View>

        <ChartContainer>
          <VictoryChart
            width={Dimensions.get('window').width - 60}
            height={210}
            padding={{ bottom: 50, left: 50, right: 30 }}
            domainPadding={{ y: 20 }}
            containerComponent={
              <VictoryVoronoiContainer
                voronoiDimension="x"
                labels={({ datum }) => 
                  `$${datum.y.toFixed(2)}\n${moment(datum.x).format('MMM D')}`
                }
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      stroke: '#EDBB68',
                      fill: 'white',
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              tickFormat={(date) => moment(date).format('DD/MM')}
              style={{
                tickLabels: { fontSize: 10, padding: 5 },
                grid: { stroke: "transparent" },
                axis: { stroke: "#888" },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => `$${value}`}
              style={{
                tickLabels: { fontSize: 10, padding: 5 },
                grid: { stroke: "#e0e0e0", strokeDasharray: "5,5" },
                axis: { stroke: "#888" },
              }}
            />
            <VictoryLine
              style={{
                data: { 
                  stroke: "#EDBB68",
                  strokeWidth: 4,
                },
              }}
              data={graphData}
            />
          </VictoryChart>
        </ChartContainer>
      </View>
      <View style={styles.card}>
  <Text style={styles.title}>Top Spending Categories</Text>
  {calculateTopSpendingCategories().map((category, index) => (
    <View key={category.category} style={styles.categoryRow}>
      <View style={styles.categoryLeft}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <View style={styles.iconContainer}>
          {renderCategoryIcon(category.category)}
        </View>
        <Text style={styles.categoryName}>{category.category}</Text>
      </View>
      <Text style={styles.amount}>-${category.amount.toFixed(2)}</Text>
    </View>
  ))}
  {calculateTopSpendingCategories().length === 0 && (
    <Text style={styles.noData}>No spending data for this period</Text>
  )}
</View>
<View style={styles.card}>
  <Text style={styles.title}>Expense Breakdown</Text>
  <View style={styles.pieChartContainer}>
  <VictoryPie
  data={calculateExpenseBreakdown()}
  width={Dimensions.get('window').width - 80}
  height={300}
  innerRadius={80}
  labelRadius={({ innerRadius }) => innerRadius + 45}
  padAngle={3}
  style={{
    data: {
      fill: ({ datum }) => CHART_COLORS[datum.x] || '#999'
    }
  }}
  animate={{ duration: 500 }}
  labelComponent={<CustomLabel />}
/>
    
    {/* Legend */}
    <View style={styles.legendContainer}>
      {calculateExpenseBreakdown().map((item) => (
        <View key={item.x} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS[item.x] || '#999' }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendCategory}>{item.x}</Text>
            <Text style={styles.legendAmount}>${item.amount} ({item.percentage}%)</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
</View>
</ScrollView>
<HelpModal
  isVisible={showHelp}
  onClose={() => setShowHelp(false)}
  title="How to Use Statistics"
  content={
    <View>
      <Text style={styles.helpText}>• View your balance trend over time</Text>
      <Text style={styles.helpText}>• Change the time range using the dropdown</Text>
      <Text style={styles.helpText}>• See your top spending categories</Text>
      <Text style={styles.helpText}>• Analyze expense breakdown in the pie chart</Text>
      <Text style={styles.helpText}>• Tap on chart points for detailed information</Text>
    </View>
  }
/>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(242,252,226)',
    padding: 20,
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
  pieChartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  legendContainer: {
    width: '100%',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendCategory: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 14,
    color: '#666',
  },
  helpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  dropdownContainer: {
    zIndex: 1000,
    marginBottom: 0,
  },
  dropdown: {
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  dropdownList: {
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 12,
    width: 30,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(255,107,107)', // Red color for expenses
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,  // Add space between cards
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
  iconContainer: {
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 5,  // Add some space after the icon
  },
});

export default Statistics;