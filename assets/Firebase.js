// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    serverTimestamp,
    query,
    where,
    addDoc
  } from "firebase/firestore";
  import { initializeAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, getReactNativePersistence, getAuth } from 'firebase/auth';
  import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
  import {Alert} from 'react-native';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhrwrHPl3c7AUUyrOB51YmIerG9i6YZD0",
  authDomain: "fbla-1ca61.firebaseapp.com",
  projectId: "fbla-1ca61",
  storageBucket: "fbla-1ca61.firebasestorage.app",
  messagingSenderId: "812239971374",
  appId: "1:812239971374:web:15bdf15dfccb41c1f1ebbf",
  measurementId: "G-MHXQFL6MRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
let auth;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

export {auth};
// Helper functions for Firestore

/**
 * Add a new transaction to Firestore and increment the transaction counter.
 * @param {string} name - Name of the transaction.
 * @param {string} category - Category of the transaction.
 * @param {string} date - Date of the transaction (ISO format preferred).
 * @param {number} amount - Amount in dollars.
 */
export const addFBTransaction = async (transaction) => {
  try {
    // Reference to NumberOfTransactions document
    const counterRef = doc(db, "transactions", "NumberOfTransactions");
    const counterSnap = await getDoc(counterRef);

    if (!counterSnap.exists()) {
      throw new Error("NumberOfTransactions document does not exist.");
    }

    

    // Add the transaction document
    const transactionRef = doc(db, "transactions", `${transaction.id}`);
    await setDoc(transactionRef, transaction);

    // Increment the counter
    await updateDoc(counterRef, {
      value: transaction.id,
    });

    console.log("Transaction added successfully.");
  } catch (error) {
    console.error("Error adding transaction:", error.message);
  }
};

export const signUp = async (email, password) => {
  
  try {
    //Create the user in firebase
    await createUserWithEmailAndPassword(auth, email, password);
    //Alert the user
    Alert.alert('Success', 'Your account has been created!');
  } catch (error) {
    // Alert based on the error code
    switch (error.code) {
      case 'auth/email-already-in-use':
        Alert.alert(
          'Email Already in Use',
          'The email address is already registered. Please use a different email or sign in.'
        );
        break;
      case 'auth/invalid-email':
        Alert.alert('Invalid Email', 'The email address is not valid.');
        break;
      case 'auth/weak-password':
        Alert.alert(
          'Weak Password',
          'The password is too weak. Please choose a stronger password.'
        );
        break;
      case 'auth/operation-not-allowed':
        Alert.alert(
          'Operation Not Allowed',
          'Email/password accounts are not enabled. Please contact support.'
        );
        break;
      default:
        Alert.alert('Error', error.message);
    }
  }
 };
 
 export const signIn = async (email, password) => {
  console.log('clicked')
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    // Handle errors based on the error code
    switch (error.code) {
      case 'auth/invalid-credential':
        Alert.alert('Invalid Email', 'The email address is not valid.');
        break;
      case 'auth/user-not-found':
        Alert.alert('User Not Found', 'No user found with this email.');
        break;
      case 'auth/wrong-password':
        Alert.alert('Incorrect Password', 'The password is incorrect.');
        break;
      default:
        Alert.alert('Error', error.message);
    }
  }
 };


 export const deleteGoal = async (goalId) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
 };
/**
 * Remove a transaction from Firestore by its ID.
 * @param {number} id - ID of the transaction to delete.
 */
export const removeTransaction = async (id) => {
  try {
    const transactionRef = doc(db, "transactions", `${id}`);
    await deleteDoc(transactionRef);
    console.log(`Transaction with ID ${id} removed successfully.`);
  } catch (error) {
    console.error("Error removing transaction:", error.message);
  }
};

/**
 * Refund a transaction by setting its `refunded` field to true.
 * @param {number} id - ID of the transaction to refund.
 */
export const refundTransaction = async (id) => {
  try {
    const transactionRef = doc(db, "transactions", `${id}`);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      throw new Error(`Transaction with ID ${id} does not exist.`);
    }

    await updateDoc(transactionRef, {
      refunded: true,
    });

    console.log(`Transaction with ID ${id} refunded successfully.`);
  } catch (error) {
    console.error("Error refunding transaction:", error.message);
  }
};

/**
 * Change a specific field of a transaction (except `refunded`).
 * @param {number} id - ID of the transaction to update.
 * @param {string} field - Field to change.
 * @param {any} value - New value for the field.
 */
export const changeTransaction = async (id, field, value) => {
  try {
    if (field === "refunded") {
      throw new Error("The 'refunded' field cannot be changed using this function.");
    }

    const transactionRef = doc(db, "transactions", `${id}`);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      throw new Error(`Transaction with ID ${id} does not exist.`);
    }

    await updateDoc(transactionRef, {
      [field]: value,
    });

    console.log(`Transaction with ID ${id} updated: ${field} set to ${value}.`);
  } catch (error) {
    console.error("Error updating transaction:", error.message);
  }
};
export const initializeStats = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
  
      // Fetch all transactions
      const querySnapshot = await getDocs(transactionsRef);
  
      let totalBalance = 0;
      let weeklyIncome = 0;
      let weeklyExpenses = 0;
  
      // Get the start of the current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
  
      // Loop through transactions
      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
  
        // Skip non-transaction documents or refunded transactions
        if (!transaction.amount || transaction.refunded) return;
  
        const transactionDate = new Date(transaction.date);
  
        // Calculate total balance
        totalBalance += transaction.amount;
  
        // Check if the transaction falls within the current week
        if (transactionDate >= startOfWeek) {
          if (transaction.amount > 0) {
            weeklyIncome += transaction.amount; // Income
          } else {
            weeklyExpenses += Math.abs(transaction.amount); // Expenses
          }
        }
      });
  
      console.log("Stats calculated successfully:", {
        totalBalance,
        weeklyIncome,
        weeklyExpenses,
      });
  
      return { totalBalance, weeklyIncome, weeklyExpenses };
    } catch (error) {
      console.error("Error initializing stats:", error.message);
      throw error;
    }
  };

  
  export const getAllTransactions = async () => {
    try {
      const counterRef = doc(db, "transactions", "NumberOfTransactions");
      const counterSnap = await getDoc(counterRef);
      const transactionsRef = collection(db, "transactions");
      const querySnapshot = await getDocs(transactionsRef);
  
      const transactions = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== "NumberOfTransactions") {
        const transaction = { id: doc.id, ...doc.data() };
        transactions.push(transaction);
        }
      });
  
      
      return {transactions, count: counterSnap.data().value};
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
      throw error;
    }
  };

// In your Firebase.js file, add these functions:
export const setBudget = async (category, amount) => {
  try {
    const docRef = doc(db, "budgets", category); // Changed from "budget" to "budgets"
    await setDoc(docRef, {
      category,
      amount,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error setting budget:", error);
    return false;
  }
};

export const getBudgets = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "budgets")); // Changed from "budget" to "budgets"
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting budgets:", error);
    return [];
  }
};
// In Firebase.js, add these functions for goals:
export const setGoal = async (goalData) => {
  try {
    const docRef = doc(collection(db, "budget", "goals"));
    await setDoc(docRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      id: docRef.id
    });
    return docRef.id;
  } catch (error) {
    console.error("Error setting goal:", error);
    return null;
  }
};

export const getGoals = async () => {
  try {
    const goalsSnapshot = await getDocs(collection(db, "goals")); // Changed path
    return goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting goals:", error);
    return [];
  }
};


  // let added = false;

  // if (!added) {
  //   addDemoTransactions().then(() => {
  //     console.log('Demo transactions added successfully');
  //     added = true;
  //   }).catch(error => {
  //     console.error('Error adding demo transactions:', error);
  //   });
  // }
  // const deleteAllTransactions = async () => {
  //   try {
  //     // Get all documents
  //     const querySnapshot = await getDocs(collection(db, "transactions"));
      
  //     // Delete each document except NumberOfTransactions
  //     const deletePromises = querySnapshot.docs.map(doc => {
  //       if (doc.id !== 'NumberOfTransactions') {
  //         return deleteDoc(doc.ref);
  //       }
  //     });
  
  //     await Promise.all(deletePromises);
  //     console.log('All transactions deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting transactions:', error);
  //   }
  // };
  // deleteAllTransactions().then(() => {
  //   console.log('All transactions deleted');
  // }).catch(error => {
  //   console.error('Error deleting transactions:', error);
  // }
  // );
  // In Firebase.js
  export const addGoal = async (goal) => {
    try {
      const goalsRef = collection(db, "goals"); // Changed from "budget/goals" to "goals"
      const docRef = doc(goalsRef);
      
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      await setDoc(docRef, {
        ...goal,
        id: docRef.id,
        currentAmount: 0,
        createdAt: serverTimestamp(),
        ownerId: user.uid,
        participants: [
          {
            userId: user.uid,
            email: user.email,
            currentAmount: 0, 
            completed: false
          }
        ],
        isShared: false
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  export const updateGoal = async (goalId, amount) => {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }
      
      const goalData = goalDoc.data();
      const user = auth.currentUser;
      
      if (!user) throw new Error("User not authenticated");
      
      if (goalData.isShared) {
        // For shared goals, update the participant's amount
        const updatedParticipants = goalData.participants.map(participant => {
          if (participant.userId === user.uid) {
            return {
              ...participant,
              currentAmount: amount,
              completed: amount >= goalData.targetAmount,
              completedAt: amount >= goalData.targetAmount ? serverTimestamp() : null
            };
          }
          return participant;
        });
        
        // Calculate total amount from all participants
        const totalAmount = updatedParticipants.reduce((sum, participant) => 
          sum + participant.currentAmount, 0);
        
        // Check if all participants have completed the goal
        const allCompleted = updatedParticipants.every(p => p.completed);
        
        await updateDoc(goalRef, { 
          participants: updatedParticipants,
          currentAmount: totalAmount,
          isCompleted: allCompleted,
          lastUpdated: serverTimestamp()
        });
      } else {
        // For individual goals, just update the amount
        await updateDoc(goalRef, { 
          currentAmount: amount,
          isCompleted: amount >= goalData.targetAmount,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  };
  
  // Share a goal with another user
  export const shareGoal = async (goalId, recipientEmail) => {
    try {
      const goalRef = doc(db, "goals", goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error("Goal not found");
      }
      
      const goalData = goalDoc.data();
      const user = auth.currentUser;
      
      if (!user) throw new Error("User not authenticated");
      
      // Make sure the current user is the owner
      if (goalData.ownerId !== user.uid) {
        throw new Error("Only the goal owner can share it");
      }
      
      // Check if the recipient is already a participant
      if (goalData.participants.some(p => p.email === recipientEmail)) {
        throw new Error("This user is already participating in the goal");
      }
      
      // Find the user by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", recipientEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // User not found, create an invitation instead
        const inviteRef = collection(db, "goalInvitations");
        await addDoc(inviteRef, {
          goalId: goalId,
          goalName: goalData.name,
          senderEmail: user.email,
          recipientEmail: recipientEmail,
          createdAt: serverTimestamp(),
          status: "pending"
        });
        
        return { success: true, message: "Invitation sent to " + recipientEmail };
      }
      
      // Add the recipient to the participants
      const recipientData = querySnapshot.docs[0].data();
      const updatedParticipants = [...goalData.participants, {
        userId: recipientData.uid,
        email: recipientEmail,
        currentAmount: 0,
        completed: false
      }];
      
      await updateDoc(goalRef, {
        participants: updatedParticipants,
        isShared: true,
        lastUpdated: serverTimestamp()
      });
      
      return { success: true, message: "Goal shared with " + recipientEmail };
    } catch (error) {
      console.error("Error sharing goal:", error);
      return { success: false, message: error.message };
    }
  };
  
  // Get goal invitations for the current user
  export const getGoalInvitations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const invitesRef = collection(db, "goalInvitations");
      const q = query(invitesRef, where("recipientEmail", "==", user.email), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting invitations:", error);
      return [];
    }
  };
  
  // Accept or decline a goal invitation
  export const respondToGoalInvitation = async (invitationId, accept) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const inviteRef = doc(db, "goalInvitations", invitationId);
      const inviteDoc = await getDoc(inviteRef);
      
      if (!inviteDoc.exists()) {
        throw new Error("Invitation not found");
      }
      
      const inviteData = inviteDoc.data();
      
      // Update invitation status
      await updateDoc(inviteRef, {
        status: accept ? "accepted" : "declined",
        respondedAt: serverTimestamp()
      });
      
      if (accept) {
        // Add the user to the goal participants
        const goalRef = doc(db, "goals", inviteData.goalId);
        const goalDoc = await getDoc(goalRef);
        
        if (goalDoc.exists()) {
          const goalData = goalDoc.data();
          const updatedParticipants = [...goalData.participants, {
            userId: user.uid,
            email: user.email,
            currentAmount: 0,
            completed: false
          }];
          
          await updateDoc(goalRef, {
            participants: updatedParticipants,
            isShared: true,
            lastUpdated: serverTimestamp()
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error responding to invitation:", error);
      return { success: false, message: error.message };
    }
  };


  export const updateUserProfile = async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

