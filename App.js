import React, { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { requestNotificationPopup, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate, getNavigationRef } from './src/navigation/NavigationService'; // Import the navigation function
import { requestCameraAndAudioPermissions } from './src/utils/PermissionHandler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationPopup from './src/components/NotificationPopup';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const notificationQueue = useRef([]).current;

  useEffect(() => {
    // Hide splash screen
    SplashScreen.hide();

    if(Platform.OS === 'ios'){
      requestUserPermission()
    }

    // Request permissions and set up notifications
    requestNotificationPopup().then(() => {
      const unsubscribeForeground = setupNotificationHandlers(
        setNotifications, 
        setnotifyStatus,
        null,
        (notification) => {
          console.log('Foreground notification received:', {
            screen: notification?.data?.screen,
            title: notification?.notification?.title,
            currentScreen: isCurrentScreenChatScreen() ? 'ChatScreen' : 'Other'
          });
          
          // Skip popup if user is already on ChatScreen (ChatScreen handles its own notifications)
          if (isCurrentScreenChatScreen()) {
            console.log('Skipping notification popup - user is on ChatScreen');
            return;
          }
          
          // Skip popup for notifications specifically meant for ChatScreen
          // if (notification?.data?.screen === 'ChatScreen' || notification?.data?.screen === 'Cancel') {
          //   console.log('Skipping notification popup - notification is for ChatScreen');
          //   return;
          // }
          
          console.log('Showing notification popup');
          // Show notification popup when app is in foreground
          if (showNotificationPopup) {
            // If popup is already visible, add to queue
            notificationQueue.push(notification);
          } else {
            // Show popup immediately
            setCurrentNotification(notification);
            setShowNotificationPopup(true);
          }
        }
      );

      // Handle notification when the app is opened from a background state
      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      // Handle notification when the app is opened from a quit state
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        } else if (remoteMessage?.data?.screen === 'WalletScreen') {
          navigate('WalletScreen');
        }
      });

      // Clean up foreground listener on unmount
      return () => {
        if (unsubscribeForeground) unsubscribeForeground();
      };
    });
  }, []);

  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();
  
    if (authorizationStatus) {
      console.log('Permission status:', authorizationStatus);
    }
  }

  const handleNotificationPopupClose = () => {
    setShowNotificationPopup(false);
    setCurrentNotification(null);
    
    // Process next notification in queue after a short delay
    setTimeout(() => {
      if (notificationQueue.length > 0) {
        const nextNotification = notificationQueue.shift();
        setCurrentNotification(nextNotification);
        setShowNotificationPopup(true);
      }
    }, 300);
  };

  // Helper function to check if current screen is ChatScreen
  const isCurrentScreenChatScreen = () => {
    try {
      const navigationRef = getNavigationRef();
      if (navigationRef?.current?.getState) {
        const state = navigationRef.current.getState();
        
        // Function to recursively check nested routes
        const findCurrentRoute = (navState) => {
          if (!navState) return null;
          
          const currentRoute = navState.routes[navState.index];
          if (!currentRoute) return null;
          
          // If this route has nested state, check it recursively
          if (currentRoute.state) {
            const nestedRoute = findCurrentRoute(currentRoute.state);
            return nestedRoute || currentRoute;
          }
          
          return currentRoute;
        };
        
        const currentRoute = findCurrentRoute(state);
        return currentRoute?.name === 'ChatScreen';
      }
      return false;
    } catch (error) {
      console.log('Error checking current screen:', error);
      return false;
    }
  };

  const handleNotificationAction = (notification) => {
    // Handle notification action based on data
    if (notification?.data?.screen === 'ScheduleScreen') {
      navigate('Schedule', { screen: 'ScheduleScreen' });
    } else if (notification?.data?.screen === 'WalletScreen') {
      navigate('WalletScreen');
    }
    // Add more screen navigation logic as needed
    
    // Close popup and process queue
    handleNotificationPopupClose();
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
      <StatusBar
          translucent={false}
          backgroundColor="#000"
          barStyle="light-content"
        />
      <OfflineNotice />
      <AuthProvider>
        <AppNav />
      </AuthProvider>
      <Toast />
      <NotificationPopup
        isVisible={showNotificationPopup}
        notification={currentNotification}
        onClose={handleNotificationPopupClose}
        onAction={handleNotificationAction}
      />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
