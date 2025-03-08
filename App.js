import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Home from './screens/Home';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Statistics from './screens/Statistics';
import Budgeting from './screens/Budgeting';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as firebase from './assets/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import Onboarding from './components/Onboarding';
import { LogBox } from 'react-native'
// SplashScreen.preventAutoHideAsync();
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

LogBox.ignoreAllLogs();


const MainAppNavigator = () => {
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const sortTransactionsByDate = (transactions) => {
    if (!transactions) return [];
    
    return transactions.sort((a, b) => {
      // Parse the date strings (format: DD/MM/YY)
      const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
      const [bDay, bMonth, bYear] = b.date.split('/').map(Number);
      
      // Create Date objects (adding 2000 to the year for full year representation)
      const aDate = new Date(2000 + aYear, aMonth - 1, aDay);
      const bDate = new Date(2000 + bYear, bMonth - 1, bDay);
      
      // Sort in descending order (most recent first)
      return bDate.getTime() - aDate.getTime();
    });
  };
  useEffect(() => {
    
    const initializeAppData = async () => {
          try {
            // Fetch all transactions and sort them
            let data = await firebase.getAllTransactions();  
            setTransactions(sortTransactionsByDate(data.transactions));
            setCount(data.count);
           
            
            
          } catch (error) {
            console.error("Error initializing app data:", error.message);
          }
        };
      
        initializeAppData();
  }, [])
  useEffect(() => {
    setTransactions(sortTransactionsByDate(transactions));
  }, [transactions])
  async function addTransaction (transaction) {
    try {
      let newId = count + 1
      let newTransaction = {
        ...transaction,
        id: newId,
        refunded: false,
      }
      setTransactions(prev => [newTransaction, ...prev])
      setCount(newId)
      
      firebase.addFBTransaction(newTransaction)
      console.log('Transaction added')
    } catch (error) {
      console.error("Error adding transaction:", error.message);
    }
  }


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            if (focused) {
              return <FontAwesome name="home" size={size} color={color} />;
            } else {
              return <AntDesign name="home" size={size} color={color} />;
            }
          } else if (route.name === 'Statistics') {
            let name = 'pie-chart-' + (focused ? 'sharp' : 'outline');
            return <Ionicons name={name} size={size} color={color} />;
          } else if (route.name === 'Budgeting') {
            let name = 'wallet' + (focused ? '' : '-outline');
            return <Ionicons name={name} size={size} color={color} />;  
          }
        },
        tabBarActiveTintColor: '#EDBB68',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        children={({navigation}) => (
          <Home 
            navigation={navigation} 
            transactions={transactions} 
            setTransactions={setTransactions}
            addTransaction={addTransaction}
          />
        )}
      />
      <Tab.Screen 
        name="Statistics" 
        children={({navigation}) => (
          <Statistics 
            navigation={navigation} 
            route={{ params: { transactions: transactions || [] } }}
            transactions={transactions}
          />
        )}
      />
      <Tab.Screen 
        name="Budgeting" 
        children={({navigation}) => (
          <Budgeting 
            transactions={transactions}
          />
        )}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
 
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);
 
  useEffect(() => {
    let {auth} = firebase;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await firebase.getUserProfile(user.uid);
          // Show onboarding only if this is a new user (no profile)
          if (!profile) {
            setShowOnboarding(true);
            await firebase.updateUserProfile(user.uid, {
              isNewUser: false
            });
          }
        }
        setUser(user);
        setLoading(false);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Error hiding splash screen:', e);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('./assets/ActivityIndicator.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!user ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            </>
          ) : showOnboarding ? (
            <Stack.Screen 
              name="Onboarding" 
              children={({navigation}) => (
                <Onboarding setShowOnboarding={setShowOnboarding} />
              )}
              options={{ headerShown: false }} 
            />
          ) : (
            <Stack.Screen 
              name="MainApp" 
              component={MainAppNavigator} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
