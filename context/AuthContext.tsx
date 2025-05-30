import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword as firebaseUpdatePassword,
  UserCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { firebaseAuth, firebaseDB } from '../backend/config/firebase.config';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé pour stocker l'email dans AsyncStorage
const EMAIL_FOR_SIGNIN = 'emailForSignIn';

interface CustomUser extends FirebaseUser {
  name?: string;
  bloodType?: string;
  birthDate?: Date;
  createdAt?: any;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, bloodType?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendSignInLink: (email: string) => Promise<void>;
  completeSignInWithLink: (email: string, link: string) => Promise<void>;
  checkSignInLink: (link: string) => boolean;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshUserFromFirestore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isSignedIn = user !== null;

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: any = {};
        try {
          const userDoc = await getDoc(doc(firebaseDB, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
        } catch (e) {
          console.log('Erreur Firestore:', e);
        }
        setUser({
          ...firebaseUser,
          ...userData,
          birthDate: userData.birthDate ? new Date(userData.birthDate) : undefined,
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string, bloodType?: string): Promise<UserCredential> => {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      // Mettre à jour le profil dans Firebase Auth
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Stocker des informations supplémentaires dans Firestore
        // Mais ne pas bloquer le processus d'inscription si Firestore échoue
        setDoc(doc(firebaseDB, 'users', userCredential.user.uid), {
          name,
          email,
          bloodType: bloodType || 'O+',
          birthDate: userCredential.user.metadata.creationTime ? new Date(userCredential.user.metadata.creationTime).toISOString() : undefined,
          createdAt: serverTimestamp()
        }).catch(error => {
          console.log('Erreur lors de la sauvegarde dans Firestore - continuez sans synchronisation');
        });
      }
      
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
      // Nettoyer les données locales
      try {
        await AsyncStorage.removeItem(EMAIL_FOR_SIGNIN);
        // Si vous stockez d'autres données locales, les nettoyer ici
      } catch (storageError) {
        console.log('Erreur de nettoyage des données locales:', storageError);
        // Continuer même en cas d'erreur de stockage
      }
      // Le reste sera géré par le subscriber onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Fonction pour envoyer un lien de connexion par email
  const sendSignInLink = async (email: string) => {
    try {
      // Configuration du lien d'authentification
      const actionCodeSettings = {
        // URL avec le domaine autorisé dans Firebase 
        url: 'https://meducare01-ea9c1.firebaseapp.com/finishSignIn',
        handleCodeInApp: true,
        // Information sur l'application Android
        android: {
          packageName: 'com.meducare.app',
          installApp: true,
          minimumVersion: '12'
        },
        // Information sur l'application iOS
        iOS: {
          bundleId: 'com.meducare.app'
        }
      };
      
      // Envoyer le lien d'authentification
      await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
      
      // Sauvegarder l'email dans AsyncStorage pour le récupérer plus tard
      await AsyncStorage.setItem(EMAIL_FOR_SIGNIN, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Vérifier si un lien est un lien d'authentification
  const checkSignInLink = (link: string): boolean => {
    if (!link) return false;
    return isSignInWithEmailLink(firebaseAuth, link);
  };

  // Terminer l'authentification avec un lien
  const completeSignInWithLink = async (email: string, link: string) => {
    try {
      const result = await signInWithEmailLink(firebaseAuth, email, link);
      
      // Créer ou mettre à jour le profil utilisateur si nécessaire
      if (result.user && !result.user.displayName) {
        const name = email.split('@')[0]; // Utiliser la partie avant @ comme nom par défaut
        
        // Mettre à jour le profil
        await updateProfile(result.user, {
          displayName: name
        });
        
        // Tenter de créer l'utilisateur dans Firestore mais ne pas bloquer l'authentification
        setDoc(doc(firebaseDB, 'users', result.user.uid), {
          name,
          email: result.user.email || email,
          bloodType: 'O+', // Valeur par défaut
          birthDate: result.user.metadata.creationTime ? new Date(result.user.metadata.creationTime).toISOString() : undefined,
          createdAt: serverTimestamp()
        }).catch(error => {
          console.log('Erreur Firestore lors de la connexion par lien - continuez sans synchronisation');
        });
      }
      
      // Supprimer l'email de AsyncStorage
      await AsyncStorage.removeItem(EMAIL_FOR_SIGNIN);
      
      // Le reste sera géré par le subscriber onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Fonction pour rafraîchir les infos utilisateur depuis Firestore
  const refreshUserFromFirestore = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(firebaseDB, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          ...user,
          ...userData,
          birthDate: userData.birthDate ? new Date(userData.birthDate) : undefined,
        });
      }
    } catch (e) {
      console.log('Erreur lors du rafraîchissement utilisateur:', e);
    }
  };

  const value = {
    user,
    loading,
    isSignedIn,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    sendSignInLink,
    completeSignInWithLink,
    checkSignInLink,
    updatePassword,
    refreshUserFromFirestore
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 