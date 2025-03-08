import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as firebase from '../assets/Firebase';

const LoginScreen = ({ navigation }) => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  setLoading(true);
   try {
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!(email && password)) {
        Alert.alert('Error', 'Please enter both an email and a password');
        return;
    } else if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
    }
     await firebase.signIn(email, password);
     
   } catch (error) {
     Alert.alert('Error', error.message);
   } finally {
    setLoading(false);
   }
 };

 return (
   <View style={styles.container}>
     
     <Image source = {require('../assets/logo_transwtext.png')} style={{width: 300, height: 300, alignSelf: 'center', marginBottom: 90,}} />
     <TextInput
       style={styles.input}
       placeholder="Email"
       value={email}
       onChangeText={setEmail}
       autoCapitalize="none"
       keyboardType="email-address"
       autoCorrect={false}
     />
     <TextInput
       style={styles.input}
       placeholder="Password"
       value={password}
       onChangeText={setPassword}
       secureTextEntry
     />
     {loading ? (
        <View style = {[styles.button, {backgroundColor: "transparent"}]}>
          <ActivityIndicator size = "small" color = "#EDBB68" />
        </View>
     ) : (
     
     <TouchableOpacity style={styles.button} onPress={handleLogin}>
       <Text style={styles.buttonText}>Login</Text>
     </TouchableOpacity>
     )}

     <View style={styles.linksContainer}>
       <TouchableOpacity onPress={() => {}}>
         <Text style={styles.linkText}>Forgot Password?</Text>
       </TouchableOpacity>
       
       <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
         <Text style={styles.linkText}>Don't have an account? Sign up</Text>
       </TouchableOpacity>
     </View>
   </View>
 );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: '#F5F5F5',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 30,
      marginTop: 30,
      bottom: 80,
      textAlign: 'center',
    },
    input: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
    },
    button: {
      backgroundColor: '#EDBB68',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    linksContainer: {
      marginTop: 20,
      gap: 15,
    },
    linkText: {
      color: '#EDBB68',
      textAlign: 'center',
    },
});

export default LoginScreen;