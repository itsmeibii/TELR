import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as firebase from '../assets/Firebase';
import { Feather } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    const checkPasswordRequirements = (text) => {
        setRequirements({
            length: text.length >= 8,
            uppercase: /[A-Z]/.test(text) && /[a-z]/.test(text),
            number: /\d/.test(text),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(text)
        });
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        checkPasswordRequirements(text);
    };

    const handleSignUp = async () => {
        if (!(email && password && confirmPassword)) {
            Alert.alert('Error', 'Please enter all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (!Object.values(requirements).every(Boolean)) {
            Alert.alert('Error', 'Please meet all password requirements');
            return;
        }
        try {
            setLoading(true);
            await firebase.signUp(email, password);
            setLoading(false);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const RequirementItem = ({ met, text }) => (
        <View style={styles.requirementRow}>
            {met ? 
                <Feather name="check-circle" size={16} color="#4CAF50" /> : 
                <Feather name="circle" size={16} color="#666" />
            }
            <Text style={[
                styles.requirementText,
                met && styles.requirementMet
            ]}>
                {text}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            
            <Image 
                source={require('../assets/logo_transwtext.png')} 
                style={[styles.logo, {marginVertical: password.length == 0 ? 100 : 50,}]}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
            />
            
            {password.length > 0 && (
                <View style={styles.requirementsContainer}>
                    <RequirementItem 
                        met={requirements.length}
                        text="At least 8 characters long"
                    />
                    <RequirementItem 
                        met={requirements.uppercase}
                        text="Contains uppercase & lowercase letters"
                    />
                    <RequirementItem 
                        met={requirements.number}
                        text="Contains at least one number"
                    />
                    <RequirementItem 
                        met={requirements.special}
                        text="Contains at least one special character"
                    />
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            {loading ? (
                <View style={[styles.button, {backgroundColor: 'transparent'}]}>
                    <ActivityIndicator size="small" color="#EDBB68" />
                </View>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 40,
    },
    logo: {
        width: 300, 
        height: 300, 
        alignSelf: 'center', 
        
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
    linkText: {
        color: '#EDBB68',
        textAlign: 'center',
        marginTop: 20,
    },
    requirementsContainer: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requirementText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    requirementMet: {
        color: '#4CAF50',
    }
});

export default SignUpScreen;