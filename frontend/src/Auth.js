// src/Auth.js
import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInAnonymously, TwitterAuthProvider } from "firebase/auth";
import { auth } from "./firebaseConfig";

const Auth = () => {
    const [result, setResult] = useState('');

    useEffect(() => {
        // Load Telegram Widget Script
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_NAME);
        script.setAttribute('data-size', 'medium');
        script.setAttribute('data-auth-url', `${process.env.REACT_APP_API_URL}/auth/telegram`);
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        // Add callback for Telegram authentication
        window.onTelegramAuth = async (user) => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/telegram`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setResult(data.sessionToken);
            } catch (error) {
                setResult(`Error: ${error.message}`);
            }
        };

        // Add script to the document
        const container = document.getElementById('telegram-login');
        container.appendChild(script);

        return () => {
            container.removeChild(script);
        };
    }, []);

    const copyToClipboard = () => {
        // Extract just the token value
        const token = result;
        navigator.clipboard.writeText(token);
    };

    const handleSignIn = async (provider) => {
        try {
            setResult('Signing in...');
            console.log("auth", auth);
            console.log("provider", provider);
            const result = await signInWithPopup(auth, provider);
            console.log("result", result);
            const idToken = await result.user.getIdToken();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idToken, provider: provider.providerId })
            });
            
            console.log("response", response);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            const cleanToken = data.sessionToken.replace('Session Token: ', '');
            setResult(cleanToken);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    const handleAnonymousSignIn = async () => {
        try {
            setResult('Signing in anonymously...');
            const result = await signInAnonymously(auth);
            const idToken = await result.user.getIdToken();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/anonymous`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idToken, provider: 'anonymous' })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            const cleanToken = data.sessionToken.replace('Session Token: ', '');
            setResult(cleanToken);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                Firebase Authentication Web Browser Test
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button
                    style={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        width: '200px'
                    }}
                    onClick={() => handleSignIn(new GoogleAuthProvider())}>
                    Sign in with Google
                </button>
                <button
                    style={{
                        backgroundColor: '#1E40AF',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        width: '200px'
                    }}
                    onClick={() => handleSignIn(new FacebookAuthProvider())}>
                    Sign in with Facebook
                </button>
                <button
                    style={{
                        backgroundColor: '#1DA1F2', // Twitter blue color
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        width: '200px'
                    }}
                    onClick={() => handleSignIn(new TwitterAuthProvider())}>
                    Sign in with Twitter
                </button>
                <button
                    style={{
                        backgroundColor: '#6B7280',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        width: '200px'
                    }}
                    onClick={handleAnonymousSignIn}>
                    Continue as Guest
                </button>

                {/* Telegram Login Button Container */}
                <div id="telegram-login" style={{ width: '200px' }}></div>
            </div>
            {!result.includes('Error:') && result !== 'Signing in...' && result && (
                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    maxWidth: '600px',
                    margin: '24px auto'
                }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                    }}>
                        Session Token:
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}>
                        <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>{result}</div>
                        <button
                            onClick={copyToClipboard}
                            style={{
                                flexShrink: 0,
                                padding: '4px 8px',
                                backgroundColor: '#4B5563',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
            {(result.includes('Error:') || result === 'Signing in...') && (
                <div style={{ marginTop: '16px', fontSize: '14px' }}>{result}</div>
            )}
        </div>
    );

};

export default Auth;
