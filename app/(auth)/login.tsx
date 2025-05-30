import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, AlertButton, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseError } from 'firebase/app';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  const router = useRouter();
  const { signIn, forgotPassword } = useAuth();
  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(email.trim(), password);
      router.replace('/learn');
    } catch (e: any) {
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      let errorDetails = '';
      
      const firebaseError = e as FirebaseError;
      switch (firebaseError.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email ou mot de passe incorrect';
          errorDetails = 'Veuillez vérifier vos identifiants';
          Alert.alert(
            errorMessage,
            errorDetails,
            [
              {
                text: 'OK',
                style: 'default' as AlertButton['style']
              },
              {
                text: 'Mot de passe oublié ?',
                onPress: handleForgotPassword,
                style: 'destructive' as AlertButton['style']
              }
            ],
            { cancelable: false }
          );
          break;
        case 'auth/user-disabled':
          errorMessage = 'Compte désactivé';
          errorDetails = 'Votre compte a été désactivé. Veuillez contacter le support';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives de connexion';
          errorDetails = 'Compte temporairement bloqué. Veuillez réinitialiser votre mot de passe ou réessayer plus tard';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion internet';
          errorDetails = 'Vérifiez votre connexion et réessayez';
          break;
        default:
          errorMessage = 'Une erreur est survenue';
          errorDetails = 'Veuillez réessayer';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email pour réinitialiser votre mot de passe');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setResetEmailSent(true);
      Alert.alert(
        "Email envoyé",
        "Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception."
      );
    } catch (e: any) {
      let errorMessage = 'Impossible d\'envoyer l\'email de réinitialisation';
      
      const firebaseError = e as FirebaseError;
      if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte ne correspond à cette adresse email';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFocus = (y: number) => {
    scrollViewRef.current?.scrollTo({
      y: y,
      animated: true
    });
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/meducare-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>MEDUCARE</Text>
          <Text style={styles.subtitle}>Votre santé, notre priorité</Text>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {resetEmailSent && <Text style={styles.successText}>Email de réinitialisation envoyé</Text>}
          
          <View style={styles.inputContainer}>
            <Image 
              source={require('../../assets/images/mail.png')} 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => handleFocus(200)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="lock" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              onFocus={() => handleFocus(250)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <MaterialCommunityIcons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.passwordlessButton}
            onPress={() => router.push('/(auth)/email-link')}
          >
            <Text style={styles.passwordlessButtonText}>
              Se connecter sans mot de passe
            </Text>
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Vous n'avez pas de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  errorText: {
    color: '#FF3B30',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#FFD5D5',
  },
  successText: {
    color: '#34C759',
    backgroundColor: '#E8F8E8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#D1EFD1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordlessButton: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordlessButtonText: {
    color: '#333',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 10,
  },
  signupText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
  signupLink: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  eyeIcon: {
    padding: 8,
  },
}); 