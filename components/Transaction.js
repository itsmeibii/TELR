import { Text, TouchableOpacity, View, Dimensions, Platform, Alert, Pressable, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather, FontAwesome5, Ionicons, FontAwesome6, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import ReactNativeModal from 'react-native-modal';
import { useFonts, Ubuntu_400Regular} from '@expo-google-fonts/ubuntu';
import * as firebase from '../assets/Firebase';

// Move Icons object outside the component
export const Icons = {
  Imported: ({size = [45,23]}) => (
    <View style={{
      width: size[0],
      height: size[0],
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 23,
      marginHorizontal: 10
    }}>
      <Fontisto name="import" size={size[1]} color='rgba(0,0,0,0.8)' style = {{left: 2.5, bottom: 1}} />
    </View>
  ),
  Travel: ({income, size = [45,23]}) => (
    <View style={{
      width: size[0],
      height: size[0],
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
      borderRadius: 23,
      marginHorizontal: 10
    }}>
      <MaterialCommunityIcons name="airplane-takeoff" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
    </View>
  ),
    Groceries: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <Feather name="shopping-cart" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Income: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <FontAwesome6 name="money-bill-alt" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Bills: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <Ionicons name="receipt-outline" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Food: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <FontAwesome5 name="utensils" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Refund: ({size = [45,25]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cfcfcf',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <MaterialCommunityIcons name="cash-refund" size={size[1]} color='#666666' style={{bottom: 2}} />
      </View>
    ),
    // New icons for remaining categories
    Investment: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <MaterialCommunityIcons name="chart-line" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Misc: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <Feather name="grid" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Donations: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <FontAwesome5 name="hand-holding-heart" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
    Salary: ({income, size = [45,23]}) => (
      <View style={{
        width: size[0],
        height: size[0],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: income > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,107,0.1)',
        borderRadius: 23,
        marginHorizontal: 10
      }}>
        <FontAwesome5 name="briefcase" size={size[1]} color={income > 0 ? 'rgb(76,175,80)' : 'rgb(255,107,107)'} />
      </View>
    ),
};
// Move helper function outside the component
const formatDateString = (inputDate) => {
    // Input is in format DD/MM/YY
    const [day, month, shortYear] = inputDate.split('/').map(Number);
    
    // Convert 2-digit year to 4-digit year
    const year = shortYear < 50 ? 2000 + shortYear : 1900 + shortYear;
    
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate)) {
      throw new Error('Invalid date format. Use DD/MM/YY.');
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const timeDiff = today.getTime() - parsedDate.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
  
    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Yesterday';
    if (dayDiff > 1) return `${dayDiff} days ago`;
    return 'In Future';
  };

const Transaction = ({ item, deleteTransaction, refresh }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [refunded, setRefunded] = useState(item.refunded);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
    const [editedAmount, setEditedAmount] = useState(item.amount.toString());
    const [editedCategory, setEditedCategory] = useState(item.category);
    const [editedDate, setEditedDate] = useState(item.date);
    const IconComponent = refunded ? Icons['Refund'] : Icons[item.category] || Icons['Imported'];
    
    let [fontsLoaded] = useFonts({
      Ubuntu_400Regular,
    });
    
    const {width: wd} = Dimensions.get('window');
    
    // Remove the useEffect for IconComponent since we're calculating it directly
  
    const red = 'rgb(255,107,107)';
    const green = 'rgb(76,175,80)';
    
    function toggleModal() {
      setModalVisible(!modalVisible);
    }
    const handleSaveChanges = async () => {
      // Validate changes
      if (!editedName.trim()) {
        Alert.alert("Invalid Input", "Name cannot be empty");
        return;
      }

      const numAmount = parseFloat(editedAmount);
      if (isNaN(numAmount)) {
        Alert.alert("Invalid Input", "Amount must be a valid number");
        return;
      }

      // Save changes one by one
      try {
        await firebase.changeTransaction(item.id, "name", editedName);
        await firebase.changeTransaction(item.id, "amount", numAmount);
        await firebase.changeTransaction(item.id, "category", editedCategory);
        await firebase.changeTransaction(item.id, "date", editedDate);

        Alert.alert("Success", "Transaction updated successfully");
        setIsEditing(false);
        // Optionally refresh the transaction list here
      } catch (error) {
        Alert.alert("Error", "Failed to update transaction");
      }
    };

  
    // If we need a loading state, we can handle it this way
    if (!IconComponent) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="black" />
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={toggleModal}>
          <ReactNativeModal
            testID={'modal'}
            isVisible={modalVisible}
            onSwipeComplete={toggleModal}
            onBackdropPress={toggleModal}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={{
              justifyContent: 'flex-end',
              margin: 0,
            }}
          >
            <View style={{
              backgroundColor: 'rgb(245,245,245)',
              padding: 22,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: isEditing ? 450 : 350,
              alignItems: 'center'
            }}>
              <Pressable onPress={toggleModal} style={{position: 'absolute', top: 10, right: 10}}>
                <Feather name="x" size={30} color="rgba(0,0,0,0.8)" />
              </Pressable>
  
              <TouchableOpacity 
                style={{position: 'absolute', top: 10, left: 10}}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Feather name={isEditing ? "check" : "edit-2"} size={24} color="rgba(0,0,0,0.8)" />
              </TouchableOpacity>
  
              <View name="iconandtitle" style={{width: '100%', height: '55%', alignItems: 'center'}}>
                <IconComponent income={item.amount} size={[90,40]} />
                {isEditing ? (
                  <>
                    <TextInput
                      style={{
                        width: '80%',
                        height: 40,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        marginVertical: 5,
                        backgroundColor: 'white',
                      }}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Transaction Name"
                    />
                    <TextInput
                      style={{
                        width: '80%',
                        height: 40,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        marginVertical: 5,
                        backgroundColor: 'white',
                      }}
                      value={editedAmount}
                      onChangeText={setEditedAmount}
                      keyboardType="numeric"
                      placeholder="Amount"
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#4CAF50',
                        padding: 10,
                        borderRadius: 8,
                        marginTop: 10,
                        width: '80%',
                        alignItems: 'center'
                      }}
                      onPress={handleSaveChanges}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Save Changes</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[{fontSize: 20, fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', marginTop: 15}]}>
                      {item.name}
                    </Text>
                    <Text style={{fontSize: 15, color: 'rgba(0,0,0,0.5)', marginTop: 5}}>
                      {item.category}
                    </Text>
                  </>
                )}
              </View>
  
              <View name='amountanddate' style={{width: '90%', height: '20%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View name='amount' style={{width: '30%', height: '100%'}}>
                  <Text style={{fontSize: 17, fontWeight: 300, marginBottom: 10}}>Amount</Text>
                  <Text style={{fontSize: 20, fontWeight: 'bold', color: item.amount > 0 ? green : red}}>
                    {item.amount > 0 ? `+${item.amount}` : item.amount}
                  </Text>
                </View>
                <View name='date' style={{height: '100%'}}>
                  <Text style={{fontSize: 17, fontWeight: '300', marginBottom: 10}}>Date</Text>
                  <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>{item.date}</Text>
                </View>
              </View>
  
              <View name='buttons' style={{width: '100%', height: '15%', marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert(
                      "Delete Transaction",
                      `Are you sure you want to delete "${item.name}"?`,
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Delete",
                          onPress: () => {
                            toggleModal();
                            firebase.removeTransaction(item.id);
                            setTimeout(() => deleteTransaction(item.id), 300);
                            refresh();
                          },
                          style: "destructive",
                        },
                      ],
                      { cancelable: true }
                    );
                  }} 
                  style={{
                    height: '100%', 
                    width: (item.amount < 0 && !refunded) ? '48%' : '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: 'rgb(255,107,108)', 
                    borderRadius: 15,
                  }}
                >
                  <Text style={{fontFamily: 'Ubuntu_400Regular', fontSize: 17, color: 'white'}}>Delete</Text>
                </TouchableOpacity>
                {(item.amount < 0 && !refunded) && (
                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        "Refund Transaction",
                        `Are you sure you want to refund "${item.name}"? The balance will be credited to your account`,
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Refund",
                            onPress: () => {
                              toggleModal();
                              setTimeout(() => {
                                setRefunded(true);
                                item.refunded = true;
                                refundTransaction(item.id);
                                refresh();
                                Alert.alert(`Refunded Successfully. $${item.amount.toString().substring(1)} has been credited to your account`);
                              }, 300);
                            },
                            style: "destructive",
                          },
                        ],
                        { cancelable: true }
                      );
                    }} 
                    style={{
                      height: '100%', 
                      width: '48%', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      backgroundColor: 'rgb(254,183,107)', 
                      borderRadius: 15,
                    }}
                  >
                    <Text style={{fontFamily: 'Ubuntu_400Regular', fontSize: 17, color: 'white'}}>Refund</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ReactNativeModal>
  
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            padding: 10,
            marginVertical: 5,
            marginHorizontal: 10,
            borderRadius: 15,
            height: 80,
            width: wd - 40,
            backgroundColor: 'rgba(255,255,255,0.8)',
            ...Platform.select({
              ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1
              },
              android: { elevation: 5 }
            })
          }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconComponent income={item.amount} />
              <View style={{marginLeft: 10}}>
                <Text style={[{fontSize: 16, fontWeight: '500', color: 'black', marginBottom: 5}, refunded && {textDecorationLine: 'line-through'}]}>
                  {item.name}
                </Text>
                <Text style={{fontSize: 14, fontWeight: '400'}}>
                  {item.category}
                </Text>
              </View>
            </View>
            <View style={{alignItems: 'center', width: '25%'}}>
              <Text style={[{fontSize: 16, fontWeight: '500', color: item.amount > 0 ? green : red}, refunded && {textDecorationLine: 'line-through', color: 'gray'}]}>
                {item.amount > 0 ? `+${item.amount}` : item.amount}
              </Text>
              <Text>{formatDateString(item.date)}</Text>
            </View>
          </View>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
  // ... existing styles ...
  editInput: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Transaction;