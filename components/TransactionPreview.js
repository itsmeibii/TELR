import { Text, TouchableOpacity, View, FlatList, Platform, Dimensions, Modal, ActivityIndicator } from 'react-native';
import React from 'react';
import { Feather, FontAwesome5, Ionicons, FontAwesome6 } from '@expo/vector-icons';

import RNModal from 'react-native-modal';
import Transaction from './Transaction';

const TransactionPreview = ({SeeAll, transactions, deleteTransaction, refresh}) => {
 
  

  return (
    <View
      style={{
        width: '100%',
        height: '50%',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
       
      }}
    >
      <View
        style={{
          width: '100%',
          height: 50,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.1)',
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '600',
            marginLeft: 10,
            color: 'rgba(0,0,0,0.8)',
          }}
        >
          Recent Transactions
        </Text>
        <TouchableOpacity onPress = {() => SeeAll()}>
          <Text
            style={{
              color: 'rgba(87,255,20,0.8)',
              fontSize: 15,
              fontWeight: '400',
              marginRight: 10,
            }}
          >
            See all
          </Text>
        </TouchableOpacity>
      </View>
      {!transactions?.length ? (
        <View style = {{flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="rgba(0,0,0,0.8)" />
        </View>
      ) : (
      <FlatList
        data={transactions}
        renderItem={({item, index}) => <Transaction item = {item} index = {index} deleteTransaction = {deleteTransaction} refresh = {refresh} />}
        keyExtractor={(item) => item.id?? item.transaction_id}
        contentContainerStyle={{
          paddingVertical: 10,
          
          width: '100%', // Full width for the FlatList content container
          alignItems: 'center', // Center items horizontally
          
        }}
        showsVerticalScrollIndicator={false}
      />
      )}
    </View>
  );
};

export  {TransactionPreview};
