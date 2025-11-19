import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform, Linking, Modal, TouchableOpacity, TouchableWithoutFeedback, StatusBar, Keyboard } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity as GestureTouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon, audioBgImg, defaultUserImg, switchcameraIcon, chatCallIcon, chatColor, messageImg, docsForChat, imageForChat } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import { TabActions, useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import firestore, { endBefore } from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  ChannelProfileType,
  RtcSurfaceView,
  IRtcEngine
} from 'react-native-agora';
import moment from 'moment-timezone'
import Loader from '../../utils/Loader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import { requestNotificationPermission, checkNotificationPermission } from '../../utils/NotificationService';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState(null);
  const [chatData, setChatData] = useState(null);

  const routepage = useRoute();

  // For audio call
  const appId = AGORA_APP_ID;
  const [token, setToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const uid = 0; // Local user UID, no need to modify

  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState(null);
  const [agentId, setAgentId] = useState(2);
  const [agentProfilePic, setAgentProfilePic] = useState('');
  const [agentName, setAgentName] = useState('');
  const [userProfilePic, setUserProfilePic] = useState('');
  const [userName, setUserName] = useState('');
  const [chatgenidres, setChatgenidres] = useState("");
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(true)
  const [isAttachPopupVisible, setIsAttachPopupVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // useEffect(() => {
  //   // console.log(routepage.name);
  //   if (routepage.name === 'ChatScreen') {
  //     const backAction = () => {
  //       // Prevent the default back button action
  //       return true;
  //     };

  //     // Add event listener to handle the back button
  //     const backHandler = BackHandler.addEventListener(
  //       'hardwareBackPress',
  //       backAction
  //     );

  //     // Clean up the event listener when the component unmounts
  //     return () => backHandler.remove();
  //   }
  // }, [routepage]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Validate route params
        if (!route?.params?.userId) {
          throw new Error('User ID is missing');
        }

        // Set userId from route params
        setUserId(route.params.userId);
        console.log('Initializing chat with userId:', route.params.userId);

        // Fetch customer message data
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('User token is missing');
        }

        const response = await axios.post(`${API_URL}/agent/message`,
          {
            customer_id: route.params.userId
          }, {
          headers: {
            Accept: 'application/json',
            "Authorization": 'Bearer ' + userToken,
          },
        });

        if (!response.data || response.data.response !== true) {
          throw new Error('Invalid response from server');
        }

        const data = response.data.data;
        console.log('Chat data received:', data);

        // Update all state values
        setChatData(data);
        setToken(data.agora_token);
        setChannelName(data.agora_channel_id);
        //setToken('007eJxTYMh/eLvQUO7jv/jXkq8+Hl/x8YJ85+WqcuGQbs/6PRM51k1XYDCwtLQ0NzI1TjQyMjAxTTOySDNLNDdOMzJKMUsyMTCwWOsfl9EQyMhQqfCeiZEBAkF8TobE9PyixJLU4hIGBgCdpCLj');
        //setChannelName('agoratest');
        setChatgenidres(data.uuid);
        setAgentProfilePic(data.agent.profile_photo_url);
        setUserProfilePic(data.customer.profile_photo_url);
        setAgentId(data.agent.user_id);
        setAgentName(data.username);
        setUserName(data.customer.full_name);

        // Initialize video SDK
        await setupVideoSDKEngine();
        KeepAwake.activate();
        await goingToactiveTab(route.params.flag || 'chat');
        // Check and request notification permissions
        await requestNotificationPermissions();

        // Show notification permission alert if not granted
        if (!notificationStatus) {
          // Alert.alert(
          //   'Enable Notifications',
          //   'Stay updated with important messages and calls by enabling notifications.',
          //   [
          //     {
          //       text: 'Not Now',
          //       style: 'cancel',
          //     },
          //     {
          //       text: 'Enable',
          //       onPress: () => requestNotificationPermissions(),
          //     },
          //   ]
          // );
        }

      } catch (error) {
        console.error('Error initializing chat:', error);
        let errorMessage = 'Failed to initialize chat. Please try again.';

        if (error.message === 'User ID is missing') {
          errorMessage = 'Invalid user ID. Please try again.';
        } else if (error.message === 'User token is missing') {
          errorMessage = 'Authentication error. Please login again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        Alert.alert('Error', errorMessage, [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    return async () => {
      //agoraEngineRef.current?.destroy();
      leaveChannel();
      KeepAwake.deactivate();
      await agoraEngineRef.current?.destroy();
      agoraEngineRef.current = null;
    };
  }, [route?.params?.userId]); // Add dependency on route.params.userId

  // Separate useEffect for Firestore listener
  useEffect(() => {
    if (!chatgenidres) return; // Don't set up listener if chatgenidres is not set

    const docid = chatgenidres;
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")
      .limit(50); // Add limit for performance

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data();
        return {
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        };
      });
      setMessages(allmsg);
    }, (error) => {
      console.error('Firestore listener error:', error);
    });

    return () => {
      unSubscribe();
    }
  }, [chatgenidres]); // Only re-run when chatgenidres changes

  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View style={styles.chatFooter}>
          <Image source={{ uri: imagePath }} style={{ height: 75, width: 75 }} />
          <GestureTouchableOpacity
            onPress={() => setImagePath('')}
            style={styles.buttonFooterChatImg}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </GestureTouchableOpacity>
        </View>
      );
    }
    if (filePath) {
      return (
        <View style={styles.chatFooter}>
          <InChatFileTransfer
            filePath={filePath}
          />
          <GestureTouchableOpacity
            onPress={() => setFilePath('')}
            style={styles.buttonFooterChat}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </GestureTouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filePath, imagePath]);

  // Custom InputToolbar with pin icon inside input
  const customInputToolbar = (props) => {
    return (
      <View style={styles.inputToolbarWrapper}>
        <GestureTouchableOpacity style={styles.pinIconWrapper} onPress={() => {
          Keyboard.dismiss();
          setIsAttachPopupVisible(!isAttachPopupVisible);
        }}>
          <Image source={filesendImg} style={styles.pinIcon} />
        </GestureTouchableOpacity>
        <View style={styles.inputFieldWrapper}>
          <Composer {...props} textInputStyle={styles.inputText} placeholder="Type a message..." />
        </View>
        <Send {...props} text={props.text}>
          <Image source={sendImg} style={styles.sendIcon} />
        </Send>
      </View>
    );
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    console.log(currentMessage)
    if (currentMessage.isDocument && currentMessage.file) {
      return (
        <View>
          <TouchableOpacity
            onPress={async () => {
              try {
                if (currentMessage.file.uri) {
                  // Show loading indicator
                  setIsLoading(true);

                  // Get the file extension
                  const fileExtension = currentMessage.file.name.split('.').pop().toLowerCase();

                  // Download the file first
                  const localPath = await downloadFileFromURL(currentMessage.file.uri, currentMessage.file.name);

                  // Handle different file types
                  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExtension)) {
                    // For these file types, we can use FileViewer
                    await FileViewer.open(localPath, {
                      showOpenWithDialog: true,
                      onDismiss: () => {
                        setIsLoading(false);
                      }
                    });
                  } else {
                    // For other file types, try to open with the device's default handler
                    const supported = await Linking.canOpenURL(`file://${localPath}`);
                    if (supported) {
                      await Linking.openURL(`file://${localPath}`);
                    } else {
                      Alert.alert(
                        'Cannot Open File',
                        'This file type is not supported on your device.',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                }
              } catch (error) {
                console.error('Error opening file:', error);
                Alert.alert(
                  'Error',
                  'Unable to open this file. Please make sure you have an appropriate app installed to view this file type.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsLoading(false);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={{
              backgroundColor: props.position === 'right' ? '#FF455C' : '#F3F3F3',
              borderRadius: 12,
              padding: 10,
              margin: 4,
              maxWidth: 220,
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              width: responsiveWidth(50),
            }}>
              <Image
                source={docsForChat}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 8,
                  tintColor: props.position === 'right' ? '#fff' : '#7F66FF'
                }}
              />
              <Text style={{
                color: props.position === 'right' ? '#fff' : '#222',
                flex: 1,
                fontFamily: 'Poppins-Regular',
                fontSize: 14
              }}>
                {currentMessage.file.name}
              </Text>
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 12,
              color: '#888',
              marginLeft: props.position === 'right' ? 0 : 10,
              marginRight: props.position === 'right' ? 10 : 0,
              marginTop: 2,
              fontFamily: 'Poppins-Italic',
              textAlign: props.position === 'right' ? 'right' : 'left',
            }}
          >
            {`reply by ${currentMessage.user?.name || 'User'}`}
          </Text>
        </View>
      );
    }

    if (currentMessage.isImage && currentMessage.image) {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              setPreviewImageUri(currentMessage.image);
              setIsImageModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <View style={{
              backgroundColor: props.position === 'right' ? '#FF455C' : '#F3F3F3',
              borderRadius: 12,
              padding: 6,
              margin: 4,
              maxWidth: 220,
              alignItems: 'center',
            }}>
              <Image source={{ uri: currentMessage.image }} style={{ width: 120, height: 120, borderRadius: 8 }} />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 12,
              color: '#888',
              marginLeft: props.position === 'right' ? 0 : 10,
              marginRight: props.position === 'right' ? 10 : 0,
              marginTop: 2,
              fontFamily: 'Poppins-Italic',
              textAlign: props.position === 'right' ? 'right' : 'left',
            }}
          >
            {`reply by ${currentMessage.user?.name || 'User'}`}
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Bubble
          {...props}
          wrapperStyle={{
            right: styles.bubbleRight,
            left: styles.bubbleLeft,
          }}
          textStyle={{
            right: styles.bubbleTextRight,
            left: styles.bubbleTextLeft,
          }}
          timeTextStyle={{
            right: styles.bubbleTime,
            left: styles.bubbleTime,
          }}
        />
        <Text
          style={{
            fontSize: 12,
            color: '#888',
            marginLeft: props.position === 'right' ? 0 : 10,
            marginRight: props.position === 'right' ? 10 : 0,
            marginTop: 2,
            fontFamily: 'Poppins-Italic',
            textAlign: props.position === 'right' ? 'right' : 'left',
          }}
        >
          {`reply by ${currentMessage.user?.name || 'User'}`}
        </Text>
      </View>
    );
  };
  const downloadFileFromURL = async (url, fileName) => {
    try {
      console.log('Downloading file:', fileName);

      // Create a local path for the file
      const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Check if file already exists
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        console.log('File already exists locally:', localPath);
        return localPath;
      }

      // Download the file
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        background: true, // Enable background downloads
        discretionary: true, // Allow the system to schedule the download
        cacheable: true, // Allow caching
      }).promise;

      if (downloadResult.statusCode === 200) {
        console.log('File downloaded successfully:', localPath);
        return localPath;
      } else {
        throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file for viewing');
    }
  };
  const cleanupOldCachedFiles = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;
      const files = await RNFS.readDir(cacheDir);

      // Get current time
      const now = new Date().getTime();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

      // Remove files older than a week
      for (const file of files) {
        const fileTime = new Date(file.mtime).getTime();
        if (fileTime < oneWeekAgo) {
          await RNFS.unlink(file.path);
          console.log('Removed old cached file:', file.name);
        }
      }
    } catch (error) {
      console.error('Error cleaning up cached files:', error);
    }
  };
  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };

  const onSend = async (messageArray) => {
    try {
      const message = messageArray[0];

      // Validate required fields
      if (!message || !message.text) {
        throw new Error('Invalid message format');
      }

      // Create message data with consistent structure
      const messageData = {
        _id: message._id || Math.random().toString(),
        text: message.text,
        createdAt: new Date(), // Use local timestamp for immediate display
        user: {
          _id: agentId,
          name: agentName || 'Agent',
          avatar: agentProfilePic || ''
        }
      };

      // Handle image messages
      if (message.image) {
        messageData.image = message.image;
        messageData.isImage = true;
      }

      // Handle document messages
      if (message.file) {
        messageData.file = {
          uri: message.file.uri || '',
          name: message.file.name || '',
          type: message.file.type || ''
        };
        messageData.isDocument = true;
      }

      // Validate chatgenidres
      if (!chatgenidres) {
        throw new Error('Chat ID is missing');
      }

      // Update local state immediately for better UX
      setMessages(previousMessages => GiftedChat.append(previousMessages, [messageData]));

      // Store in Firestore with server timestamp
      const firestoreData = {
        ...messageData,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(firestoreData);

      // Call message-send API
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          await axios.post(`${API_URL}/agent/message-send`, {
            customer_id: route?.params?.userId
          }, {
            headers: {
              Accept: 'application/json',
              "Authorization": 'Bearer ' + userToken,
            },
          });
          console.log('Message-send API called successfully');
        }
      } catch (apiError) {
        console.error('Error calling message-send API:', apiError);
        // Don't throw here as the message was already sent to Firestore
      }

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
    }
  };


  // audio call 
  const agoraEngineRef = useRef(null); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [localUid, setLocalUid] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isVideLoading, setIsVideLoading] = useState(true);

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await getPermission();
      }

      // Create new engine instance
      const engine = createAgoraRtcEngine();
      if (!engine) {
        throw new Error('Failed to create Agora engine');
      }

      // Initialize the engine
      await engine.initialize({
        appId: appId,
      });

      // Set channel profile before enabling audio
      await engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      // Enable audio and set audio profile
      await engine.enableAudio();
      await engine.setAudioProfile({
        profile: 0, // Standard quality
        scenario: 0, // Default scenario
      });

      // Set client role
      await engine.setClientRole({
        role: ClientRoleType.ClientRoleBroadcaster
      });

      // Register event handlers
      engine.registerEventHandler({
        onJoinChannelSuccess: (connection, localUid, elapsed) => {
          console.log('Successfully joined the channel:', channelName, 'with uid:', localUid);
          setLocalUid(localUid);
          setIsJoined(true);
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log('Remote user joined:', remoteUid);
          setRemoteUid(remoteUid);
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log('Remote user left:', remoteUid, 'reason:', reason);
          setRemoteUid(null);
        },
        onError: (err, msg) => {
          console.error('Agora error:', err, msg);
          // Don't auto-recover for error 109 as it might be a false positive
          if (err !== 109) {
            console.log('Attempting to recover from error...');
            cleanupAgoraEngine().then(() => {
              setupVideoSDKEngine();
            });
          }
        },
        onConnectionStateChanged: (state, reason) => {
          console.log('Connection state changed:', state, 'reason:', reason);
          // Handle connection state changes
          if (state === 1) { // CONNECTING
            console.log('Connecting to channel...');
          } else if (state === 3) { // CONNECTED
            console.log('Connected to channel');
          } else if (state === 5) { // FAILED
            console.log('Connection failed, attempting to reconnect...');
            cleanupAgoraEngine().then(() => {
              setupVideoSDKEngine();
            });
          }
        },
        onConnectionLost: () => {
          console.log('Connection lost');
        },
        onRejoinChannelSuccess: (connection, localUid, elapsed) => {
          console.log('Rejoined channel successfully');
        }
      });

      // Store the engine reference
      agoraEngineRef.current = engine;

      await toggleSpeakerphone(true);
      console.log('Agora engine setup completed successfully');

    } catch (e) {
      console.error('Error in setupVideoSDKEngine:', e);
      throw e;
    }
  };

  // Add cleanup function
  const cleanupAgoraEngine = async () => {
    try {
      if (agoraEngineRef.current) {
        await agoraEngineRef.current.leaveChannel();
        await agoraEngineRef.current.release();
        agoraEngineRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up Agora engine:', error);
    }
  };

  // Update useEffect cleanup
  useEffect(() => {
    const initialize = async () => {
      try {
        // ... existing initialization code ...
      } catch (error) {
        // ... existing error handling ...
      }
    };

    initialize();
    return () => {
      cleanupAgoraEngine();
    };
  }, [route?.params?.userId]);

  const getPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return granted;
      } else {
        //const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const micStatus = await check(PERMISSIONS.IOS.MICROPHONE);

        // if (cameraStatus !== RESULTS.GRANTED) {
        //   await request(PERMISSIONS.IOS.CAMERA);
        // }

        if (micStatus !== RESULTS.GRANTED) {
          await request(PERMISSIONS.IOS.MICROPHONE);
        }
      }
    } catch (err) {
      console.warn('Permission error:', err);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      // For iOS, use Firebase messaging permission request
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS notification permission granted');
          setNotificationStatus(true);
        } else {
          console.log('iOS notification permission denied');
          setNotificationStatus(false);
        }
        return;
      }

      // For Android, use react-native-permissions with proper error handling
      try {
        const currentPermission = await checkNotificationPermission();

        // If permission is not granted, request it
        if (currentPermission !== 'granted') {
          const permissionResult = await requestNotificationPermission();

          if (permissionResult === 'granted') {
            console.log('Android notification permission granted');
            setNotificationStatus(true);
          } else {
            console.log('Android notification permission denied');
            setNotificationStatus(false);
          }
        } else {
          console.log('Android notification permission already granted');
          setNotificationStatus(true);
        }
      } catch (permissionError) {
        console.error('Permission check/request error:', permissionError);
        // Fallback: try to check using Firebase messaging
        try {
          const authStatus = await messaging().hasPermission();
          const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          setNotificationStatus(enabled);
        } catch (firebaseError) {
          console.error('Firebase permission check error:', firebaseError);
          setNotificationStatus(false);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationStatus(false);
    }
  };

  const toggleMic = async () => {
    try {
      const engine = agoraEngineRef.current;
      if (!engine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (micOn) {
        await engine.muteLocalAudioStream(true);
        console.log('Microphone muted');
      } else {
        await engine.muteLocalAudioStream(false);
        console.log('Microphone unmuted');
      }
      setMicOn(!micOn);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      Alert.alert('Error', 'Failed to toggle microphone. Please try again.');
    }
  };

  const toggleSpeaker = async () => {
    try {
      const engine = agoraEngineRef.current;
      if (!engine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (speakerOn) {
        await engine.setEnableSpeakerphone(false);
        console.log('Speaker turned off');
      } else {
        await engine.setEnableSpeakerphone(true);
        console.log('Speaker turned on');
      }
      setSpeakerOn(!speakerOn);
    } catch (error) {
      console.error('Error toggling speaker:', error);
      Alert.alert('Error', 'Failed to toggle speaker. Please try again.');
    }
  };

  const toggleSwitchCamera = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (!agoraEngine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (cameraOn) {
        agoraEngine.switchCamera(); // Switch between front and rear cameras
        // console.log('Camera switched');
      } else {
        console.log('Camera is off, cannot switch');
      }
    } catch (e) {
      console.log('Error switching camera:', e);
    }
  };

  // Define the join method called after clicking the join channel button
  const joinChannel = async () => {
    const agoraEngine = agoraEngineRef.current;

    if (!agoraEngine) {
      // console.log('Agora engine is not initialized');
      return;
    }

    try {
      // Set channel profile
      await agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      // Start video preview
      await agoraEngine.startPreview();
      await agoraEngine.muteLocalVideoStream(false)
      await agoraEngine?.setDefaultAudioRouteToSpeakerphone(true);
      // Join the channel
      await agoraEngine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsVideLoading(false)
      setCameraOn(true);
      //console.log('Successfully joined the channel: ' + channelName);
    } catch (error) {
      console.log('Error joining channel:', error);
      console.log('Failed to join the channel. Please try again.');
      setIsVideLoading(false)
    }
  };


  const leaveChannel = async () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine?.leaveChannel();
      await agoraEngine?.setDefaultAudioRouteToSpeakerphone(true);
      setRemoteUid(null);
      setIsJoined(false);
      setIsVideoEnabled(false);
      setMicOn(true); // Ensure mic is on when leaving the channel
      setSpeakerOn(true); // Ensure speaker is on when leaving the channel
      // console.log('You left the channel');
    } catch (e) {
      console.log(e);
    }

  };

  const toggleSpeakerphone = async (enable) => {
    const agoraEngine = agoraEngineRef.current;
    try {
      await agoraEngine?.setEnableSpeakerphone(enable);
      // Set the default audio route to the speakerphone if `enable` is true
      if (enable) {
        await agoraEngine?.setDefaultAudioRouteToSpeakerphone(true);
      }
    } catch (error) {
      console.error("Failed to toggle speakerphone:", error);
    }
  };

  const startVideoCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.enableVideo();
    setIsVideoEnabled(true);
  };

  const startAudioCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.disableVideo();
    setIsVideoEnabled(false);
  };

  const goingToactiveTab = async (name) => {
    try {
      if (name === 'audio') {
        setIsLoading(true);
        console.log('Starting audio call initialization...');

        // Cleanup existing engine if any
        await cleanupAgoraEngine();

        // Fetch channel details before initializing engine
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('User token is missing');
        }

        console.log('Fetching channel details for userId:', route?.params?.userId);
        const response = await axios.post(`${API_URL}/agent/message`,
          {
            customer_id: route?.params?.userId
          }, {
          headers: {
            Accept: 'application/json',
            "Authorization": 'Bearer ' + userToken,
          },
        });

        if (!response.data || response.data.response !== true) {
          throw new Error('Failed to get channel details from server');
        }

        const data = response.data.data;
        console.log('Channel details received:', {
          channelId: data.agora_channel_id,
          hasToken: !!data.agora_token
        });

        // Store the values in variables instead of state
        const agoraToken = data.agora_token;
        const agoraChannelId = data.agora_channel_id;
        //const agoraToken = '007eJxTYMh/eLvQUO7jv/jXkq8+Hl/x8YJ85+WqcuGQbs/6PRM51k1XYDCwtLQ0NzI1TjQyMjAxTTOySDNLNDdOMzJKMUsyMTCwWOsfl9EQyMhQqfCeiZEBAkF8TobE9PyixJLU4hIGBgCdpCLj';
        //const agoraChannelId = 'agoratest';

        if (!agoraToken || !agoraChannelId) {
          throw new Error('Invalid channel details received');
        }

        // Update state for other components
        setToken(agoraToken);
        setChannelName(agoraChannelId);
        //setToken('007eJxTYMh/eLvQUO7jv/jXkq8+Hl/x8YJ85+WqcuGQbs/6PRM51k1XYDCwtLQ0NzI1TjQyMjAxTTOySDNLNDdOMzJKMUsyMTCwWOsfl9EQyMhQqfCeiZEBAkF8TobE9PyixJLU4hIGBgCdpCLj');
        //setChannelName('agoratest');

        // Initialize engine after getting channel details
        console.log('Initializing Agora engine...');
        await setupVideoSDKEngine();

        const engine = agoraEngineRef.current;
        if (!engine) {
          throw new Error('Failed to initialize Agora engine');
        }

        console.log('Configuring audio settings...');
        // Configure for audio call
        await engine.enableAudio();
        await engine.disableVideo();
        await engine.setDefaultAudioRouteToSpeakerphone(true);
        await engine.muteLocalAudioStream(false);

        console.log('Joining channel...', {
          channelId: agoraChannelId,
          hasToken: !!agoraToken,
          uid: uid
        });

        // Join the channel using the direct values
        try {
          await engine.joinChannel(agoraToken, agoraChannelId, uid, {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          });
          //alert('channel name ' + agoraChannelId + ' token ' + agoraToken + ' uid ' + uid);
          console.log('Successfully joined channel');

          // Set active tab only after successful join
          setActiveTab('audio');
          await AsyncStorage.setItem('activeTab', 'audio');
          setIsVideoEnabled(false);
          setSpeakerOn(true);
          setMicOn(true);
        } catch (joinError) {
          console.error('Error joining channel:', joinError);
          throw new Error('Failed to join channel');
        }
      } else if (name === 'chat') {
        console.log('Switching to chat mode...');
        await cleanupAgoraEngine();
        setActiveTab('chat');
        await AsyncStorage.setItem('activeTab', 'chat');
        setIsVideoEnabled(false);
      }
    } catch (error) {
      console.error('Error in goingToactiveTab:', error);
      let errorMessage = 'Failed to start audio call. Please try again.';

      if (error.message === 'User token is missing') {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.message === 'Failed to get channel details from server') {
        errorMessage = 'Failed to get call details. Please try again.';
      } else if (error.message === 'Invalid channel details received') {
        errorMessage = 'Invalid call configuration. Please try again.';
      } else if (error.message === 'Failed to initialize Agora engine') {
        errorMessage = 'Failed to initialize call system. Please try again.';
      } else if (error.message === 'Failed to join channel') {
        errorMessage = 'Failed to connect to call. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const requestToTabSwitch = async (name) => {
    //await goingToactiveTab(name)
    setIsLoading(true);
    const option = {
      "customer_id": route?.params?.userId,
      "flag": name
    };
    // console.log(option);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }
      const res = await axios.post(`${API_URL}/agent/conversation-switch`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });
      // console.log(res.data);
      if (res.data.response === true) {
        setIsLoading(false);
        await goingToactiveTab(name);
      } else {
        // console.log('Response not OK');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Error during handleTimerEnd:', e);
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  }

  const requestToCancel = async () => {
    const storedTab = await AsyncStorage.getItem('activeTab');
    const option = {
      "customer_id": route?.params?.userId,
      "flag": storedTab,
      "screen": storedTab
    };
    //console.log(option);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }
      const res = await axios.post(`${API_URL}/agent/conversation-cancel`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });
      // console.log(res.data);
      if (res.data.response === true) {
        setIsLoading(false);
      } else {
        // console.log('Response not OK');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Error during handleTimerEnd:', e);
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  }

  useEffect(() => {
    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        // console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.data?.screen === 'Cancel') {
          //console.log(remoteMessage?.data?.flag, 'ddddddddd')
          goingToactiveTab(remoteMessage?.data?.flag)
        }
        if (remoteMessage?.data?.screen === 'ChatScreen') {
          if (remoteMessage?.notification?.title != 'Message Sent') {
            Alert.alert(
              '',
              `The users wants to switch to ${remoteMessage?.data?.flag}. Do you agree?`,
              [
                {
                  text: 'Cancel',
                  onPress: () => requestToCancel(),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => goingToactiveTab(remoteMessage?.data?.flag),
                },
              ],
              {
                cancelable: true,
                onDismiss: () =>
                  console.log('cancel')
              },
            );
          }
        }
      });
      return unsubscribe;
    }
  }, [])

  // Keyboard listener to track keyboard height
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [])

  // Add this function to handle file upload to Firebase Storage
  const uploadFileToStorage = async (uri, fileName, fileType) => {
    try {
      console.log('Starting file upload:', { uri, fileName, fileType });

      // Create a reference to the file location in Firebase Storage
      const storageRef = storage().ref(`chat_files/${Date.now()}_${fileName}`);

      let uploadTask;

      if (Platform.OS === 'android') {
        // For Android, handle file path differently
        let fileUri = uri;

        // If it's a content:// URI, we need to handle it differently
        if (uri.startsWith('content://')) {
          // Use the copyTo path if available
          const response = await DocumentPicker.pickSingle({
            type: [DocumentPicker.types.allFiles],
            copyTo: 'cachesDirectory'
          });
          fileUri = response.fileCopyUri || response.uri;
        }

        console.log('Using file URI:', fileUri);

        // Upload directly from file path
        uploadTask = await storageRef.putFile(fileUri, {
          contentType: fileType || 'application/octet-stream',
          customMetadata: {
            originalName: fileName
          }
        });
      } else {
        // For iOS, use the blob method
        try {
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const fileBlob = await response.blob();

          uploadTask = await storageRef.put(fileBlob, {
            contentType: fileType || 'application/octet-stream',
            customMetadata: {
              originalName: fileName
            }
          });
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          // Fallback to putFile for iOS as well
          uploadTask = await storageRef.putFile(uri, {
            contentType: fileType || 'application/octet-stream',
          });
        }
      }

      console.log('Upload task completed:', uploadTask.state);

      // Get the download URL
      const downloadURL = await storageRef.getDownloadURL();
      console.log('Download URL obtained:', downloadURL);

      return {
        url: downloadURL,
        name: fileName,
        type: fileType || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  // Modify handlePickDocument function
  const handlePickDocument = async () => {
    setIsAttachPopupVisible(false);

    try {
      console.log('Starting document picker...');

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory', // This creates a local copy
        allowMultiSelection: false,
      });

      console.log('Document picked:', {
        name: res.name,
        type: res.type,
        size: res.size,
        uri: res.uri,
        fileCopyUri: res.fileCopyUri
      });

      if (!res) {
        console.log('No document selected');
        return;
      }

      // Validate file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (res.size && res.size > maxSize) {
        Alert.alert('Error', 'File size is too large. Please select a file smaller than 10MB.');
        return;
      }

      // Show loading indicator
      setIsLoading(true);

      // Use fileCopyUri if available (Android), otherwise use uri
      const fileUri = res.fileCopyUri || res.uri;
      const fileName = res.name || `file_${Date.now()}`;
      const fileType = res.type || 'application/octet-stream';

      console.log('Uploading file with URI:', fileUri);

      // Upload file to Firebase Storage
      const uploadedFile = await uploadFileToStorage(fileUri, fileName, fileType);
      console.log('File uploaded successfully:', uploadedFile);

      // Create message data
      const timestamp = new Date();
      const messageData = {
        _id: Math.random().toString(),
        createdAt: timestamp,
        user: {
          _id: agentId,
          name: agentName || 'Agent',
          avatar: agentProfilePic || null
        }
      };

      // Check if it's an image
      if (fileType && fileType.startsWith('image/')) {
        messageData.text = fileName;
        messageData.image = uploadedFile.url;
        messageData.isImage = true;
      } else {
        messageData.text = fileName;
        messageData.file = {
          uri: uploadedFile.url,
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: res.size
        };
        messageData.isDocument = true;
      }

      // Store in Firestore
      const firestoreData = {
        ...messageData,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(firestoreData);

      console.log('Message stored in Firestore');

      // Update local state for immediate UI update
      setMessages(previousMessages => GiftedChat.append(previousMessages, [messageData]));

      // Call message-send API
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          await axios.post(`${API_URL}/agent/message-send`, {
            customer_id: route?.params?.userId
          }, {
            headers: {
              Accept: 'application/json',
              "Authorization": 'Bearer ' + userToken,
            },
          });
          console.log('Message-send API called successfully');
        }
      } catch (apiError) {
        console.error('Error calling message-send API:', apiError);
        // Don't throw here as the message was already sent to Firestore
      }

    } catch (err) {
      console.error('Document picker error:', err);

      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
        return;
      }

      let errorMessage = 'Failed to upload file. Please try again.';

      if (err.message) {
        if (err.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check file permissions.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('storage')) {
          errorMessage = 'Storage error. Please try again later.';
        }
      }

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify handlePickImage function
  const handlePickImage = async () => {
    setIsAttachPopupVisible(false);

    try {
      console.log('Starting image picker...');

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });

      console.log('Image picked:', {
        name: res.name,
        type: res.type,
        size: res.size,
        uri: res.uri,
        fileCopyUri: res.fileCopyUri
      });

      if (!res) {
        console.log('No image selected');
        return;
      }

      // Validate file size (limit to 5MB for images)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (res.size && res.size > maxSize) {
        Alert.alert('Error', 'Image size is too large. Please select an image smaller than 5MB.');
        return;
      }

      // Show loading indicator
      setIsLoading(true);

      // Use fileCopyUri if available (Android), otherwise use uri
      const fileUri = res.fileCopyUri || res.uri;
      const fileName = res.name || `image_${Date.now()}`;
      const fileType = res.type || 'image/jpeg';

      console.log('Uploading image with URI:', fileUri);

      // Upload image to Firebase Storage
      const uploadedFile = await uploadFileToStorage(fileUri, fileName, fileType);
      console.log('Image uploaded successfully:', uploadedFile);

      // Create message data
      const timestamp = new Date();
      const messageData = {
        _id: Math.random().toString(),
        createdAt: timestamp,
        user: {
          _id: agentId,
          name: agentName || 'Agent',
          avatar: agentProfilePic || null
        },
        text: fileName,
        image: uploadedFile.url,
        isImage: true
      };

      // Store in Firestore
      const firestoreData = {
        ...messageData,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(firestoreData);

      console.log('Image message stored in Firestore');

      // Update local state for immediate UI update
      setMessages(previousMessages => GiftedChat.append(previousMessages, [messageData]));
      // Call message-send API
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          await axios.post(`${API_URL}/agent/message-send`, {
            customer_id: route?.params?.userId
          }, {
            headers: {
              Accept: 'application/json',
              "Authorization": 'Bearer ' + userToken,
            },
          });
          console.log('Message-send API called successfully');
        }
      } catch (apiError) {
        console.error('Error calling message-send API:', apiError);
        // Don't throw here as the message was already sent to Firestore
      }

    } catch (err) {
      console.error('Image picker error:', err);

      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled image picker');
        return;
      }

      let errorMessage = 'Failed to upload image. Please try again.';

      if (err.message) {
        if (err.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check file permissions.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('storage')) {
          errorMessage = 'Storage error. Please try again later.';
        }
      }

      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle the API call when going back
  const handleGoBack = useCallback(async () => {
    console.log('handleGoBack');
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      // Get the last message from messages array
      const lastMessage = messages.length > 0 ? messages[0].text : '';

      const response = await axios.post(`${API_URL}/agent/message`, {
        customer_id: route?.params?.userId,
        last_message: lastMessage
      }, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });

      if (response.data.response === true) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update last message');
      }
    } catch (error) {
      console.error('Error updating last message:', error);
      Alert.alert('Error', 'Failed to update last message');
    }
  }, [agentId, messages, navigation]);

  // Add useFocusEffect to handle back navigation
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        handleGoBack();
        return true
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [handleGoBack])
  );

  // Check notification permission when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkNotificationPermissionStatus = async () => {
        try {
          if (Platform.OS === 'ios') {
            const authStatus = await messaging().hasPermission();
            const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            setNotificationStatus(enabled);
          } else {
            try {
              const currentPermission = await checkNotificationPermission();
              setNotificationStatus(currentPermission === 'granted');
            } catch (permissionError) {
              console.error('Permission check error:', permissionError);
              // Fallback to Firebase messaging
              const authStatus = await messaging().hasPermission();
              const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
              setNotificationStatus(enabled);
            }
          }
        } catch (error) {
          console.error('Error checking notification permission:', error);
          setNotificationStatus(false);
        }
      };

      checkNotificationPermissionStatus();
    }, [])
  );

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <View style={styles.headerContainer}>
        <GestureTouchableOpacity onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </GestureTouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: responsiveWidth(90) }}>
          <View style={styles.headerTitleContainer}>
            {userProfilePic ? (
              <Image
                source={{ uri: userProfilePic }}
                style={styles.profileIcon}
              />
            ) : (
              <Image
                source={defaultUserImg}
                style={styles.profileIcon}
              />
            )}
            <Text style={[styles.headerTitle, { marginLeft: 10 }]}>{userName || "Users"}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <GestureTouchableOpacity onPress={() => requestToTabSwitch(activeTab === 'chat' ? 'audio' : 'chat')}>
              <Image source={activeTab === 'chat' ? chatCallIcon : messageImg} style={[styles.headerCallIcon, { marginRight: 10 }]} tintColor={'#FF455C'} />
            </GestureTouchableOpacity>
          </View>
        </View>
      </View>
      {/* <View style={styles.chatContainer}> */}
      {activeTab === 'chat' ? (
        <GiftedChat
          messages={messages}
          renderInputToolbar={customInputToolbar}
          renderBubble={renderBubble}
          scrollToBottom
          user={{
            _id: agentId,
            name: agentName || 'Agent',
            avatar: agentProfilePic
          }}
          renderAvatar={null}
          onSend={onSend}
        />
      ) : activeTab === 'audio' ? (
        <LinearGradient colors={['#4c669f', '#417AA4', '#192f6a']} style={styles.AudioBackground}>
          {userProfilePic ? (
            <Image
              source={{ uri: userProfilePic }}
              style={styles.buttonImage}
            />
          ) : (
            <Image
              source={defaultUserImg}
              style={styles.buttonImage}
            />
          )}
          <Text style={styles.audioSectionTherapistName}>
            {userName || "User"}
          </Text>
          {remoteUid == null ? (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: responsiveFontSize(2), fontFamily: 'Poppins-Bold', textAlign: 'center' }}>
                Waiting for the user to join..
              </Text>
            </View>
          ) : null}
          <View style={styles.audioButtonSection}>
            <GestureTouchableOpacity onPress={() => toggleMic()}>
              <Image
                source={micOn ? audioonIcon : audiooffIcon}
                style={[styles.iconStyle, { marginRight: responsiveWidth(2) }]}
              />
            </GestureTouchableOpacity>
            <GestureTouchableOpacity onPress={() => toggleSpeaker()}>
              <Image
                source={speakerOn ? speakeronIcon : speakeroffIcon}
                style={[styles.iconStyle, { marginRight: responsiveWidth(2) }]}
              />
            </GestureTouchableOpacity>
            {/* 🔴 End Button */}
            <GestureTouchableOpacity onPress={() => requestToTabSwitch('chat')}>
              <View style={styles.endButton}>
                <Text style={styles.endButtonText}>End</Text>
              </View>
            </GestureTouchableOpacity>
          </View>
        </LinearGradient>
      ) : null}
      {/* </View> */}
      {isAttachPopupVisible && (
        <View style={[styles.attachPopupOverlay, { bottom: keyboardHeight > 0 ? keyboardHeight + 70 : 70 }]} pointerEvents="box-none">
          {/* Backdrop to close popup */}
          <GestureTouchableOpacity style={styles.attachPopupBackdrop} activeOpacity={1} onPress={() => setIsAttachPopupVisible(false)} />
          <View style={styles.attachPopupContainer}>
            <GestureTouchableOpacity style={styles.attachOption} onPress={handlePickDocument}>
              <View style={[styles.attachIconCircle, { backgroundColor: '#7F66FF' }]}>
                <Image source={docsForChat} style={styles.attachIcon} />
              </View>
              <Text style={styles.attachLabel}>Document</Text>
            </GestureTouchableOpacity>
            <GestureTouchableOpacity style={styles.attachOption} onPress={handlePickImage}>
              <View style={[styles.attachIconCircle, { backgroundColor: '#C861FA' }]}>
                <Image source={imageForChat} style={styles.attachIcon} />
              </View>
              <Text style={styles.attachLabel}>Images</Text>
            </GestureTouchableOpacity>
            <TouchableOpacity onPress={() => setIsAttachPopupVisible(false)}>
              <Text style={{ fontSize: responsiveFontSize(2), fontWeight: 'bold', color: '#222', marginTop: -10, zIndex: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        visible={isImageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsImageModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
            {previewImageUri && (
              <Image
                source={{ uri: previewImageUri }}
                style={{ width: '90%', height: '70%', borderRadius: 12, resizeMode: 'cover' }}
              />
            )}
            <GestureTouchableOpacity
              onPress={() => setIsImageModalVisible(false)}
              style={{ position: 'absolute', top: 40, right: 30, backgroundColor: '#fff', borderRadius: 20, padding: 8 }}
            >
              <Text style={{ fontSize: 18, color: '#222' }}>✕</Text>
            </GestureTouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#EAECF0',
    paddingBottom: 10,
    position: 'relative',
  },
  headerContainer: {
    height: responsiveHeight(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CACACA',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  headerTitle: {
    color: '#2D2D2D',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2),
  },
  headerSubtitle: {
    color: '#444343',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  headerCallIcon: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
  },
  chatContainer: {
    height: responsiveHeight(80),
    width: responsiveWidth(100),
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputToolbarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 48,
    paddingLeft: 10,
  },
  pinIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pinIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#B0B0B0',
  },
  inputFieldWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  inputText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.8),
  },
  bubbleRight: {
    backgroundColor: '#FF455C',
  },
  bubbleLeft: {
    backgroundColor: '#F3F3F3',
  },
  bubbleTextRight: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  bubbleTextLeft: {
    color: '#2D2D2D',
    fontFamily: 'Poppins-Regular',
  },
  bubbleTime: {
    right: {
      color: '#8A91A8',
    },
    left: {
      color: '#8A91A8',
    },
  },
  sendButtonCircle: {
    backgroundColor: '#222',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  sendIcon: {
    width: 30,
    height: 30,
    margin: 8,
    //marginBottom: responsiveHeight(2),
  },
  chatFooter: {
    shadowColor: '#ECFCFA',
    shadowOpacity: 0.37,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'blue',
    marginBottom: 10,
  },
  buttonFooterChat: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonFooterChatImg: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  textFooterChat: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: 'black',
  },
  fileContainer: {
    flex: 1,
    maxWidth: 300,
    marginVertical: 2,
    borderRadius: 15,
  },
  fileText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 5,
    color: '#2D2D2D'
  },
  textTime: {
    fontSize: 10,
    color: '#2D2D2D',
    marginLeft: 2,
  },
  agoraStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  localVideo: {
    width: '30%',
    height: 200,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },

  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    resizeMode: 'contain',
  },
  AudioBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //padding: 20,
  },
  buttonImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  audioSectionTherapistName: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  audioButtonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: responsiveWidth(30),
    position: 'absolute',
    bottom: 20,
  },
  iconStyle: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  attachPopupOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70, // just above the input bar
    zIndex: 9999,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // height: undefined, top: undefined
  },
  attachPopupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  attachPopupContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
    borderWidth: 1, // for debugging
    borderColor: '#eee', // for debugging
  },
  attachOption: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  attachIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  attachIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  attachLabel: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
  },
  endButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  endButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.5),
  },
  notificationPermissionIndicator: {
    backgroundColor: '#FF455C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff'
  },
  notificationPermissionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
});