import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 TextInput,
 Platform,
 Alert,
 FlatList,
 ActivityIndicator
} from 'react-native';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import ReactNativeModal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as firebase from '../assets/Firebase';
import { VictoryPie } from 'victory-native';

// Modal to share goal with another user
const ShareGoalModal = ({ visible, onClose, goal, onShare }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleShare = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const result = await firebase.shareGoal(goal.id, email);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        setEmail('');
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to share goal');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to share goal');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.modalTitle}>Share Goal</Text>
        </View>
        
        <Text style={styles.modalSubtitle}>
          Invite someone to compete with you on this goal!
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleShare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Send Invitation</Text>
          )}
        </TouchableOpacity>
      </View>
    </ReactNativeModal>
  );
};

// Invitations Modal to display pending invitations
const InvitationsModal = ({ visible, onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (visible) {
      loadInvitations();
    }
  }, [visible]);
  
  const loadInvitations = async () => {
    setLoading(true);
    try {
      const invites = await firebase.getGoalInvitations();
      setInvitations(invites);
    } catch (error) {
      console.error("Error loading invitations:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResponse = async (invitationId, accept) => {
    try {
      await firebase.respondToGoalInvitation(invitationId, accept);
      // Remove the invitation from the list
      setInvitations(invitations.filter(invite => invite.id !== invitationId));
      if (invitations.length <= 1) {
        // Close modal if no more invitations
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to respond to invitation');
    }
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
          <Text style={styles.modalTitle}>Goal Invitations</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator style={{marginVertical: 20}} />
        ) : invitations.length === 0 ? (
          <Text style={styles.emptyText}>No pending invitations</Text>
        ) : (
          <FlatList
            data={invitations}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.invitationItem}>
                <View>
                  <Text style={styles.invitationTitle}>{item.goalName}</Text>
                  <Text style={styles.invitationSubtitle}>From: {item.senderEmail}</Text>
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity 
                    style={[styles.invitationButton, styles.acceptButton]}
                    onPress={() => handleResponse(item.id, true)}
                  >
                    <MaterialIcons name="check" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.invitationButton, styles.declineButton]}
                    onPress={() => handleResponse(item.id, false)}
                  >
                    <MaterialIcons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ReactNativeModal>
  );
};

const UpdateProgressModal = ({ visible, onClose, goal, onUpdate }) => {
 const [amount, setAmount] = useState('');

 const handleUpdate = () => {
   const numAmount = parseFloat(amount);
   if (isNaN(numAmount)) {
     Alert.alert('Invalid Amount', 'Please enter a valid number');
     return;
   }

   // If it's a shared goal, we need to get user's current amount
   let currentAmount = 0;
   if (goal.isShared) {
     const currentUser = firebase.auth.currentUser;
     const userParticipant = goal.participants.find(p => p.userId === currentUser.uid);
     if (userParticipant) {
       currentAmount = userParticipant.currentAmount;
     }
   } else {
     currentAmount = goal.currentAmount;
   }

   const newTotal = currentAmount + numAmount;
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

const ParticipantProgress = ({ participant, goal }) => {
  const currentUser = firebase.auth.currentUser;
  const isCurrentUser = participant.userId === currentUser.uid;
  const progress = participant.currentAmount / goal.targetAmount;
  
  return (
    <View style={styles.participantContainer}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {isCurrentUser ? 'You' : participant.email.split('@')[0]}
          {participant.completed && ' 🏆'}
        </Text>
        <Text style={styles.participantAmount}>
          ${participant.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.participantProgressBar}>
        <View 
          style={[
            styles.participantProgressFill, 
            { width: `${progress * 100}%`, backgroundColor: isCurrentUser ? '#3B82F6' : '#10B981' }
          ]} 
        />
      </View>
    </View>
  );
};

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const progress = goal.currentAmount / goal.targetAmount;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const monthlyNeeded = (goal.targetAmount - goal.currentAmount) / (daysLeft / 30);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const currentUser = firebase.auth.currentUser;
  
  // Get current user's progress if shared goal
  const userParticipant = goal.isShared 
    ? goal.participants.find(p => p.userId === currentUser?.uid)
    : null;
  
  const userProgress = userParticipant 
    ? userParticipant.currentAmount / goal.targetAmount
    : progress;
  
  const isOwner = goal.ownerId === currentUser?.uid;
  const userCompleted = goal.isShared 
    ? userParticipant?.completed 
    : goal.currentAmount >= goal.targetAmount;

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

  const getCardBorderColor = () => {
    if (userCompleted) {
      return styles.completedGoalCard;
    }
    if (goal.isShared) {
      return styles.sharedGoalCard;
    }
    return {};
  };

  return (
    <View style={[styles.goalCard, getCardBorderColor()]}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleContainer}>
          <Text style={styles.goalName}>
            {goal.name}
            {goal.isShared && (
              <Text style={styles.sharedBadge}> (Shared)</Text>
            )}
          </Text>
          {userCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed!</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.deadline}>{daysLeft} days left</Text>
          {isOwner && !goal.isShared && (
            <TouchableOpacity 
              onPress={() => setShowShareModal(true)}
              style={{marginRight: 8}}
            >
              <FontAwesome name="share-alt" size={18} color="#3B82F6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete}>
            <Feather name="trash-2" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {goal.isShared ? (
        // Shared goal view with participant progress
        <View style={styles.sharedProgressSection}>
          <Text style={styles.participantsHeader}>Progress</Text>
          {goal.participants.map((participant, index) => (
            <ParticipantProgress 
              key={participant.userId || index} 
              participant={participant} 
              goal={goal}
            />
          ))}
        </View>
      ) : (
        // Regular goal view with pie chart
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
      )}

      {!userCompleted && (
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={() => setShowUpdateModal(true)}
        >
          <Text style={styles.updateButtonText}>Update Progress</Text>
        </TouchableOpacity>
      )}

      <UpdateProgressModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        goal={goal}
        onUpdate={onUpdate}
      />
      
      <ShareGoalModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        goal={goal}
      />
    </View>
  );
};

const GoalsSection = () => {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
    checkInvitations();
    
    // Set up a periodic check for new invitations
    const invitationCheck = setInterval(checkInvitations, 30000); // Check every 30 seconds
    
    return () => clearInterval(invitationCheck);
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const goalsData = await firebase.getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkInvitations = async () => {
    try {
      const invites = await firebase.getGoalInvitations();
      setInvitationCount(invites.length);
    } catch (error) {
      console.error("Error checking invitations:", error);
    }
  };

  const handleAddGoal = async (goalData) => {
    try {
      await firebase.addGoal(goalData);
      loadGoals();
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalId, newAmount) => {
    try {
      await firebase.updateGoal(goalId, newAmount);
      loadGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal');
    }
  };
  
  const handleDeleteGoal = async (goalId) => {
    try {
      await firebase.deleteGoal(goalId);
      loadGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete goal');
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addButtonText}>Add New Goal</Text>
        </TouchableOpacity>
        
        {invitationCount > 0 && (
          <TouchableOpacity 
            style={styles.invitationsButton}
            onPress={() => setShowInvitationsModal(true)}
          >
            <View style={styles.badgeContainer}>
              <MaterialIcons name="notifications" size={24} color="#3B82F6" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{invitationCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator style={{marginTop: 30}} size="large" color="#3B82F6" />
      ) : goals.length === 0 ? (
        <Text style={styles.emptyText}>You don't have any goals yet</Text>
      ) : (
        goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        ))
      )}

      <GoalModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddGoal}
      />
      
      <InvitationsModal
        visible={showInvitationsModal}
        onClose={() => {
          setShowInvitationsModal(false);
          // Refresh goals and invitations after closing the modal
          loadGoals();
          checkInvitations();
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    gap: 10,
    flex: 1,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  invitationsButton: {
    marginLeft: 10,
    padding: 8,
  },
  badgeContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 0,
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
  sharedGoalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  completedGoalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sharedBadge: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: 'white',
    fontSize: 12,
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
  sharedProgressSection: {
    marginTop: 10,
  },
  participantsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  participantContainer: {
    marginVertical: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    fontWeight: '500',
  },
  participantAmount: {
    color: '#666',
  },
  participantProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  participantProgressFill: {
    height: '100%',
    borderRadius: 4,
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
    maxHeight: '80%',
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
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
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
  closeButton: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  invitationItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invitationTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  invitationSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  invitationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
    fontSize: 16,
  }
});

export default GoalsSection;