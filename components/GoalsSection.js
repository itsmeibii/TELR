import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 TextInput,
 Platform,
 Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import ReactNativeModal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as firebase from '../assets/Firebase';
import { VictoryPie } from 'victory-native';

const UpdateProgressModal = ({ visible, onClose, goal, onUpdate }) => {
 const [amount, setAmount] = useState('');

 const handleUpdate = () => {
   const numAmount = parseFloat(amount);
   if (isNaN(numAmount)) {
     Alert.alert('Invalid Amount', 'Please enter a valid number');
     return;
   }

   const newTotal = goal.currentAmount + numAmount;
   if (newTotal > goal.targetAmount) {
     Alert.alert('Amount too high', 'This would exceed your goal amount');
     return;
   }

   onUpdate(goal.id, newTotal);
   setAmount('');
   onClose();
 };

 return (
   <ReactNativeModal
     isVisible={visible}
     onBackdropPress={onClose}
     onSwipeComplete={onClose}
     swipeDirection={['down']}
     style={styles.modal}
   >
     <View style={styles.modalContent}>
       <View style={styles.modalHeader}>
         <View style={styles.indicator} />
         <Text style={styles.modalTitle}>Update Progress</Text>
       </View>

       <Text style={styles.goalProgress}>
         Current: ${goal?.currentAmount.toFixed(2)} / ${goal?.targetAmount.toFixed(2)}
       </Text>

       <TextInput
         style={styles.input}
         placeholder="Amount to add"
         value={amount}
         onChangeText={setAmount}
         keyboardType="decimal-pad"
         autoFocus
       />

       <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
         <Text style={styles.saveButtonText}>Update Progress</Text>
       </TouchableOpacity>
     </View>
   </ReactNativeModal>
 );
};

const GoalModal = ({ visible, onClose, onSave }) => {
 const [name, setName] = useState('');
 const [targetAmount, setTargetAmount] = useState('');
 const [date, setDate] = useState(new Date());
 const [showDatePicker, setShowDatePicker] = useState(false);

 const handleSave = () => {
  //Form Validation
   if (!name || !targetAmount) {
     Alert.alert('Missing Fields', 'Please fill in all fields');
     return;
   }
   onSave({
     name,
     targetAmount: parseFloat(targetAmount),
     deadline: date.toISOString(),
     currentAmount: 0
   });
   //reset the form
 };

 return (
   <ReactNativeModal
     isVisible={visible}
     onBackdropPress={onClose}
     onSwipeComplete={onClose}
     swipeDirection={['down']}
     style={styles.modal}
   >
     <View style={styles.modalContent}>
       <View style={styles.modalHeader}>
         <View style={styles.indicator} />
         <Text style={styles.modalTitle}>New Savings Goal</Text>
       </View>

       <TextInput
         style={styles.input}
         placeholder="Goal Name"
         value={name}
         onChangeText={setName}
       />

       <TextInput
         style={styles.input}
         placeholder="Target Amount"
         value={targetAmount}
         onChangeText={setTargetAmount}
         keyboardType="decimal-pad"
       />

       <TouchableOpacity 
         style={styles.dateInput}
         onPress={() => setShowDatePicker(true)}
       >
         <Text>Deadline: {date.toLocaleDateString()}</Text>
       </TouchableOpacity>

       {showDatePicker && (
         <DateTimePicker
           value={date}
           mode="date"
           display="default"
           minimumDate={new Date()}
           onChange={(event, selectedDate) => {
             setShowDatePicker(false);
             if (selectedDate) setDate(selectedDate);
           }}
         />
       )}

       <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
         <Text style={styles.saveButtonText}>Create Goal</Text>
       </TouchableOpacity>
     </View>
   </ReactNativeModal>
 );
};

const GoalCard = ({ goal, onUpdate, onDelete }) => {
 const progress = goal.currentAmount / goal.targetAmount;
 const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
 const monthlyNeeded = (goal.targetAmount - goal.currentAmount) / (daysLeft / 30);
 const [showUpdateModal, setShowUpdateModal] = useState(false);


 const handleDelete = () => {
  Alert.alert(
    "Delete Goal",
    `Are you sure you want to delete "${goal.name}"?`,
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        onPress: () => onDelete(goal.id),
        style: "destructive" 
      }
    ]
  );
};


 return (
   <View style={styles.goalCard}>
     <View style={styles.goalHeader}>
        <Text style={styles.goalName}>{goal.name}</Text>
        <View style={styles.headerActions}>
          <Text style={styles.deadline}>{daysLeft} days left</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

     <View style={styles.progressSection}>
       <VictoryPie
         data={[
           { x: 1, y: progress },
           { x: 2, y: 1 - progress }
         ]}
         width={100}
         height={100}
         innerRadius={35}
         labels={() => null}
         style={{
           data: {
             fill: ({ datum }) => datum.x === 1 ? '#10B981' : '#E5E7EB'
           }
         }}
       />
       <View style={styles.progressInfo}>
         <Text style={styles.progressText}>
           ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
         </Text>
         <Text style={styles.monthlyNeeded}>
           ${monthlyNeeded.toFixed(2)}/month needed
         </Text>
       </View>
     </View>

     <TouchableOpacity 
       style={styles.updateButton}
       onPress={() => setShowUpdateModal(true)}
     >
       <Text style={styles.updateButtonText}>Update Progress</Text>
     </TouchableOpacity>

     <UpdateProgressModal
       visible={showUpdateModal}
       onClose={() => setShowUpdateModal(false)}
       goal={goal}
       onUpdate={onUpdate}
     />
   </View>
 );
};

const GoalsSection = () => {
 const [goals, setGoals] = useState([]);
 const [showAddModal, setShowAddModal] = useState(false);

 useEffect(() => {
   loadGoals();
 }, []);

 const loadGoals = async () => {
   const goalsData = await firebase.getGoals();
   setGoals(goalsData);
 };

 const handleAddGoal = async (goalData) => {
   await firebase.addGoal(goalData);
   loadGoals();
 };

 const handleUpdateGoal = async (goalId, newAmount) => {
   await firebase.updateGoal(goalId, newAmount);
   loadGoals();
 };
 const handleDeleteGoal = async (goalId) => {
  await firebase.deleteGoal(goalId);
  loadGoals();
};

 return (
   <Animated.View 
     entering={FadeIn.duration(500)}
     style={styles.container}
   >
     <TouchableOpacity 
       style={styles.addButton}
       onPress={() => setShowAddModal(true)}
     >
       <Feather name="plus" size={20} color="white" />
       <Text style={styles.addButtonText}>Add New Goal</Text>
     </TouchableOpacity>

     {goals.map(goal => (
        <GoalCard 
          key={goal.id} 
          goal={goal}
          onUpdate={handleUpdateGoal}
          onDelete={handleDeleteGoal}
        />
      ))}

     <GoalModal
       visible={showAddModal}
       onClose={() => setShowAddModal(false)}
       onSave={handleAddGoal}
     />
   </Animated.View>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   gap: 15,
 },
 addButton: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: '#3B82F6',
   padding: 15,
   borderRadius: 10,
   gap: 10,
 },
 addButtonText: {
   color: 'white',
   fontSize: 16,
   fontWeight: '600',
 },
 goalCard: {
   backgroundColor: 'white',
   borderRadius: 15,
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
 goalHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 15,
 },
 goalName: {
   fontSize: 18,
   fontWeight: '600',
 },
 deadline: {
   color: '#666',
 },
 progressSection: {
   flexDirection: 'row',
   alignItems: 'center',
   gap: 20,
 },
 progressInfo: {
   flex: 1,
 },
 progressText: {
   fontSize: 16,
   fontWeight: '500',
   marginBottom: 5,
 },
 monthlyNeeded: {
   color: '#666',
 },
 headerActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15,
},
 updateButton: {
   backgroundColor: '#E5E7EB',
   padding: 10,
   borderRadius: 8,
   alignItems: 'center',
   marginTop: 15,
 },
 updateButtonText: {
   color: '#374151',
   fontWeight: '500',
 },
 modal: {
   margin: 0,
   justifyContent: 'flex-end',
 },
 modalContent: {
   backgroundColor: 'white',
   borderTopLeftRadius: 20,
   borderTopRightRadius: 20,
   padding: 20,
 },
 modalHeader: {
   alignItems: 'center',
   marginBottom: 20,
 },
 indicator: {
   width: 40,
   height: 4,
   backgroundColor: '#E5E7EB',
   borderRadius: 2,
   marginBottom: 10,
 },
 modalTitle: {
   fontSize: 20,
   fontWeight: '600',
 },
 input: {
   borderWidth: 1,
   borderColor: '#E5E7EB',
   borderRadius: 8,
   padding: 12,
   fontSize: 16,
   marginBottom: 15,
 },
 dateInput: {
   borderWidth: 1,
   borderColor: '#E5E7EB',
   borderRadius: 8,
   padding: 12,
   marginBottom: 15,
 },
 saveButton: {
   backgroundColor: '#3B82F6',
   padding: 15,
   borderRadius: 8,
   alignItems: 'center',
 },
 saveButtonText: {
   color: 'white',
   fontSize: 16,
   fontWeight: '600',
 },
 goalProgress: {
   fontSize: 16,
   marginBottom: 15,
   textAlign: 'center',
 }
});

export default GoalsSection;