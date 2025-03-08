import { StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { create, open } from 'react-native-plaid-link-sdk';

const PlaidButton = ({ close, onPlaidSuccess }) => {
    const [linkToken, setLinkToken] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleLink() {
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:3000/link_token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            const token = data.linkToken;
            setLinkToken(token);

            if (token) {
                create({
                    token: token,
                    noLoadingState: false, 
                    logLevel: 'info'
                });

                close();
                
                await new Promise((resolve) => setTimeout(resolve, 1000));
                
                open({
                    onSuccess: async (success) => {
                        try {
                            const exchangeResponse = await fetch('http://localhost:3000/exchange_token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    publicToken: success.publicToken
                                })
                            });
                            const exchangeData = await exchangeResponse.json();

                            const transactionResponse = await fetch(
                                `http://localhost:3000/transactions?accessToken=${exchangeData.access_token}&startDate=2024-12-01&endDate=2024-12-31`,
                                {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                            const transactionData = await transactionResponse.json();
                            
                            const formattedTransactions = transactionData.map(t => {
                                const [year, month, day] = t.date.split('-');
                                return {
                                    date: `${day}/${month}/${year.slice(2)}`,
                                    name: t.name,
                                    amount: -t.amount,
                                    category: t.category[0],
                                    type: t.transaction_type,
                                    transaction_id: t.transaction_id,
                                    plaid_trans: true,
                                };
                            });

                            onPlaidSuccess(formattedTransactions);
                        } catch (error) {
                            console.error('Error in onSuccess:', error);
                        }
                    },
                    onExit: (exit) => {
                        console.log('Link exit:', exit);
                        setLoading(false);
                    }
                });
            }
        } catch (error) {
            console.error('Error in handleLink:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity 
            style={styles.button}
            onPress={handleLink}
            disabled={loading}
        >
            <Text style={styles.buttonText}>
                {loading ? 'Loading...' : 'Link Bank'}
            </Text>
            <Image 
                source={require('../assets/plaid_logo.png')} 
                style={styles.logo}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'black',
        height: 45,
        width: 110,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    logo: {
        height: 40,
        width: 40,
    },
});

export default PlaidButton;