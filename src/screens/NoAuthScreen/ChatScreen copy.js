import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform, Linking, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity as GestureTouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon, audioBgImg, defaultUserImg, switchcameraIcon, chatCallIcon, chatColor, messageImg, docsForChat, imageForChat } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import { TabActions, useNavigation, useRoute } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import firestore, { endBefore } from '@react-native-firebase/firestore'
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



const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState(null);

  const routepage = useRoute();

  // For audio call
  const appId = AGORA_APP_ID;
  //const token = route?.params?.details?.agora_token;
  //const channelName = route?.params?.details?.agora_channel_id;
  const uid = 0; // Local user UID, no need to modify
  const token = '007eJxTYCgQEz1lUXc7JOrtDN3XW8LvzupR1fV1LczSSD724v6/pF4FBstEc7NkkzSTxCQTCxODxCQLcyNjc0vLpLTURDPjREszpzWSGQ2BjAxxaeGMjAwQCOKzMJSkFpcwMAAATMIfHQ==';
  const channelName = 'test';

  const [messages, setMessages] = useState([])
  const [agentId, setAgentId] = useState(2);
  const [agentProfilePic, setAgentProfilePic] = useState(route?.params?.details?.agent?.profile_pic);
  const [userId, setUserId] = useState(1);
  const [userProfilePic, setUserProfilePic] = useState(route?.params?.details?.user?.profile_pic);
  const [chatgenidres, setChatgenidres] = useState("12345");
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(false)
  const [isAttachPopupVisible, setIsAttachPopupVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

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
      await setupVideoSDKEngine();
      KeepAwake.activate();
      // console.log(route?.params?.details, 'details from home page');
      //sessionStart();
    };
    initialize();
    return () => {
      //agoraEngineRef.current?.destroy();
    };
  }, []);

  const confirmEnd = () => {
    Alert.alert(
      '',
      'Are you sure you want to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleTimerEnd(),
        },
      ],
      { cancelable: false }
    );
  };


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
        <GestureTouchableOpacity style={styles.pinIconWrapper} onPress={() => setIsAttachPopupVisible(!isAttachPopupVisible)}>
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
    if (currentMessage.isDocument && currentMessage.file) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (currentMessage.file.uri) {
              FileViewer.open(currentMessage.file.uri)
                .then(() => {
                  // Success
                })
                .catch(error => {
                  Alert.alert('Error', 'Cannot open this file type');
                });
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
            <Image source={docsForChat} style={{ width: 24, height: 24, marginRight: 8, tintColor: '#7F66FF' }} />
            <Text style={{ color: props.position === 'right' ? '#fff' : '#222', flex: 1 }}>{currentMessage.file.name}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (currentMessage.isImage && currentMessage.image) {
      return (
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
      );
    }
    return (
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
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };

  useEffect(() => {
    const docid = chatgenidres;
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data()
        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate()
          }
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date()
          }
        }

      })
      setMessages(allmsg)
    })


    return () => {
      unSubscribe()
    }
  }, [])

  const onSend = async (messageArray) => {
    try {
      const message = messageArray[0];
      
      // Validate required fields
      if (!message || !message.text) {
        throw new Error('Invalid message format');
      }

      const messageData = {
        _id: message._id || Math.random().toString(),
        text: message.text || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        user: {
          _id: userId,
          name: route?.params?.details?.user?.name || 'User',
          avatar: userProfilePic || ''
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

      // Store in Firestore
      await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(messageData);

      // Update local state with the correct user ID
      const localMessage = {
        ...message,
        user: {
          _id: userId,
          name: route?.params?.details?.user?.name || 'User',
          avatar: userProfilePic
        }
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [localMessage]));
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
      if (Platform.OS === 'android') {
        await getPermission(); // Await for permission request
      }

      agoraEngineRef.current = createAgoraRtcEngine(); // Await for engine creation
      const agoraEngine = agoraEngineRef.current;

      // if (agoraEngine) {
      //   console.log('Agora engine created successfully');
      // } else {
      //   console.log('Failed to create Agora engine');
      // }
      await toggleSpeakerphone(true);

      await agoraEngine.initialize({
        appId: appId,
      }); // Await for initialization

      await agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (connection, localUid, elapsed) => {
          // console.log('Successfully joined the channel: ' + channelName);
          // alert('Successfully joined the channel: ' + channelName)
          setLocalUid(0);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          // console.log('Remote user ' + Uid + ' has joined');
          // alert('Remote user ' + Uid + ' has joined')
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          // console.log('Remote user ' + Uid + ' has left the channel');
          // alert('Remote user ' + Uid + ' has left the channel')
          setRemoteUid(null);
        },
      });

    } catch (e) {
      console.log(e);
    }
  };
  const getPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      return granted;
    } catch (err) {
      console.warn(err);
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


  const toggleCamera = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (!agoraEngine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (cameraOn) {
        agoraEngine.stopPreview(); // Stop the local video preview
        agoraEngine.muteLocalVideoStream(true); // Mute local video stream
        // console.log('Camera turned off');
      } else {
        agoraEngine.startPreview(); // Start the local video preview
        agoraEngine.muteLocalVideoStream(false); // Unmute local video stream
        // console.log('Camera turned on');
      }

      setCameraOn(!cameraOn); // Toggle camera state
    } catch (e) {
      console.log('Error toggling camera:', e);
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
        // Initialize Agora engine if not already initialized
        if (!agoraEngineRef.current) {
          await setupVideoSDKEngine();
        }

        const engine = agoraEngineRef.current;
        
        // Configure for audio call
        await engine?.enableAudio();
        await engine?.disableVideo();
        await engine?.setDefaultAudioRouteToSpeakerphone(true);
        await engine?.muteLocalAudioStream(false);
        
        // Join the channel
        await engine?.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });

        setActiveTab('audio');
        await AsyncStorage.setItem('activeTab', 'audio');
        setIsVideoEnabled(false);
        setSpeakerOn(true);
        setMicOn(true);
        setIsLoading(false);
      } else if (name === 'chat') {
        const engine = agoraEngineRef.current;
        if (engine) {
          await engine?.leaveChannel();
          await engine?.muteLocalAudioStream(true);
          await engine?.stopPreview();
          await engine?.muteLocalVideoStream(true);
        }
        setActiveTab('chat');
        await AsyncStorage.setItem('activeTab', 'chat');
        setIsVideoEnabled(false);
      }
    } catch (error) {
      console.error('Error in goingToactiveTab:', error);
      setIsLoading(false);
      Alert.alert('Error', `Failed to ${name === 'audio' ? 'start audio call' : 'switch to chat'}. Please try again.`);
    }
  };

  const requestToTabSwitch = async (name) => {
    await goingToactiveTab(name)
    // setIsLoading(true);
    // const option = {
    //   "booked_slot_id": route?.params?.details?.id,
    //   "flag": name
    // };
    // // console.log(option);
    // try {
    //   const userToken = await AsyncStorage.getItem('userToken');
    //   if (!userToken) {
    //     throw new Error('User token is missing');
    //   }
    //   const res = await axios.post(`${API_URL}/notification/tab-switch`, option, {
    //     headers: {
    //       Accept: 'application/json',
    //       "Authorization": 'Bearer ' + userToken,
    //     },
    //   });
    //   // console.log(res.data);
    //   if (res.data.response === true) {
    //     setIsLoading(false);
    //     await goingToactiveTab(name);
    //   } else {
    //     // console.log('Response not OK');
    //     setIsLoading(false);
    //     Alert.alert('Oops..', "Something went wrong", [
    //       {
    //         text: 'Cancel',
    //         onPress: () => console.log('Cancel Pressed'),
    //         style: 'cancel',
    //       },
    //       { text: 'OK', onPress: () => console.log('OK Pressed') },
    //     ]);
    //   }
    // } catch (e) {
    //   setIsLoading(false);
    //   console.error('Error during handleTimerEnd:', e);
    //   const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
    //   Alert.alert('Oops..', errorMessage, [
    //     {
    //       text: 'Cancel',
    //       onPress: () => console.log('Cancel Pressed'),
    //       style: 'cancel',
    //     },
    //     { text: 'OK', onPress: () => console.log('OK Pressed') },
    //   ]);
    // }
  }

  const requestToCancel = async () => {
    const storedTab = await AsyncStorage.getItem('activeTab');
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "flag": storedTab,
      "screen": storedTab
    };
    //console.log(option);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }
      const res = await axios.post(`${API_URL}/notification/tab-switch-cancel`, option, {
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
        if (remoteMessage?.data?.screen === 'EndCall') {
          Alert.alert('', "The therapist has disconnected the call. The balance amount (if any) will be refunded to your wallet.", [
            { text: 'OK', onPress: () => handleTimerEnd() },
          ]);
        }
        if (remoteMessage?.data?.screen === 'Cancel') {
          //console.log(remoteMessage?.data?.flag, 'ddddddddd')
          goingToactiveTab(remoteMessage?.data?.flag)
        }
        if (remoteMessage?.data?.screen === 'ChatScreen') {
          Alert.alert(
            '',
            `The therapist wants to switch to ${remoteMessage?.data?.flag}. Do you agree?`,
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
      });
      return unsubscribe;
    }
  }, [])

  // Handler for picking a document (all files except images will show as document)
  const handlePickDocument = async () => {
    setIsAttachPopupVisible(false);
    try {
      const res = await DocumentPicker.pickSingle({ 
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory'
      });

      console.log('Document picked:', res);

      if (!res || !res.uri) {
        throw new Error('No file selected or invalid file');
      }

      // Create a timestamp for local state
      const timestamp = new Date();

      const messageData = {
        _id: Math.random().toString(),
        createdAt: timestamp,
        user: {
          _id: userId,
          name: route?.params?.details?.user?.name || 'User',
          avatar: userProfilePic || null
        }
      };

      if (res.type && res.type.startsWith('image/')) {
        messageData.text = res.name || 'Image';
        messageData.image = res.uri;
        messageData.isImage = true;
      } else {
        messageData.text = res.name;
        messageData.file = {
          uri: res.uri,
          name: res.name,
          type: res.type,
          size: res.size
        };
        messageData.isDocument = true;
      }

      console.log('Message data to be stored:', messageData);

      // Store in Firestore with proper timestamp
      const firestoreData = {
        ...messageData,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(firestoreData);

      console.log('Document stored with ID:', docRef.id);

      // Update local state
      setMessages(previousMessages => GiftedChat.append(previousMessages, [{
        _id: messageData._id,
        createdAt: timestamp,
        user: messageData.user,
        text: messageData.text,
        image: messageData.image,
        file: messageData.file,
        isImage: messageData.isImage,
        isDocument: messageData.isDocument,
      }]));

    } catch (err) {
      console.error('Document picker error:', err);
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert(
          'Error',
          `Failed to upload file: ${err.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Handler for picking an image (only images)
  const handlePickImage = async () => {
    setIsAttachPopupVisible(false);
    try {
      const res = await DocumentPicker.pickSingle({ 
        type: [DocumentPicker.types.images],
        copyTo: 'cachesDirectory'
      });

      console.log('Image picked:', res);

      if (!res || !res.uri) {
        throw new Error('No image selected or invalid image');
      }

      // Create a timestamp for local state
      const timestamp = new Date();

      const messageData = {
        _id: Math.random().toString(),
        createdAt: timestamp,
        user: {
          _id: userId,
          name: route?.params?.details?.user?.name || 'User',
          avatar: userProfilePic || null
        },
        text: res.name || 'Image',
        image: res.uri,
        isImage: true
      };

      console.log('Image message data to be stored:', messageData);

      // Store in Firestore with proper timestamp
      const firestoreData = {
        ...messageData,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firestore()
        .collection('chatrooms')
        .doc(chatgenidres)
        .collection('messages')
        .add(firestoreData);

      console.log('Image stored with ID:', docRef.id);

      // Update local state
      setMessages(previousMessages => GiftedChat.append(previousMessages, [{
        _id: messageData._id,
        createdAt: timestamp,
        user: messageData.user,
        text: messageData.text,
        image: messageData.image,
        isImage: true
      }]));

    } catch (err) {
      console.error('Image picker error:', err);
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled image picker');
      } else {
        Alert.alert(
          'Error',
          `Failed to upload image: ${err.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <View style={styles.headerContainer}>
        <GestureTouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </GestureTouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',width: responsiveWidth(90) }}>
          <View style={styles.headerTitleContainer}>
            <Image source={userPhoto} style={styles.profileIcon} />
            <Text style={[styles.headerTitle, {marginLeft: 10}]}>{route?.params?.details?.agent?.name || "Agent"}</Text>
          </View>
          <GestureTouchableOpacity onPress={() => requestToTabSwitch(activeTab === 'chat' ? 'audio' : 'chat')}>
            <Image source={activeTab === 'chat' ? chatCallIcon : messageImg} style={[styles.headerCallIcon, {marginRight: 10}]} tintColor={'#FF455C'}/>
          </GestureTouchableOpacity>
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
            _id: userId,
            name: route?.params?.details?.user?.name || 'User',
            avatar: userProfilePic
          }}
          renderAvatar={null}
          onSend={onSend}
        />
      ) : activeTab === 'audio' ? (
        <LinearGradient colors={['#4c669f', '#417AA4', '#192f6a']} style={styles.AudioBackground}>
          {agentProfilePic ? (
            <Image
              source={{ uri: agentProfilePic }}
              style={styles.buttonImage}
            />
          ) : (
            <Image
              source={defaultUserImg}
              style={styles.buttonImage}
            />
          )}
          <Text style={styles.audioSectionTherapistName}>
            {route?.params?.details?.agent?.name || "Customer"}
          </Text>
          {remoteUid == null ? (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: responsiveFontSize(2), fontFamily: 'Poppins-Bold', textAlign: 'center' }}>
                Waiting for the customer to join..
              </Text>
            </View>
          ) : null}
          <View style={styles.audioButtonSection}>
            <GestureTouchableOpacity onPress={() => toggleMic()}>
              <Image
                source={micOn ? audioonIcon : audiooffIcon}
                style={styles.iconStyle}
              />
            </GestureTouchableOpacity>
            <GestureTouchableOpacity onPress={() => toggleSpeaker()}>
              <Image
                source={speakerOn ? speakeronIcon : speakeroffIcon}
                style={styles.iconStyle}
              />
            </GestureTouchableOpacity>
          </View>
        </LinearGradient>
      ) : null}
      {/* </View> */}
      {isAttachPopupVisible && (
        <View style={styles.attachPopupOverlay} pointerEvents="box-none">
          {/* Backdrop to close popup */}
          <GestureTouchableOpacity style={styles.attachPopupBackdrop} activeOpacity={1} onPress={() => setIsAttachPopupVisible(false)} />
          <View style={styles.attachPopupContainer}>
            <GestureTouchableOpacity style={styles.attachOption} onPress={handlePickDocument}>
              <View style={[styles.attachIconCircle, {backgroundColor: '#7F66FF'}]}>
                <Image source={docsForChat} style={styles.attachIcon} />
              </View>
              <Text style={styles.attachLabel}>Document</Text>
            </GestureTouchableOpacity>
            <GestureTouchableOpacity style={styles.attachOption} onPress={handlePickImage}>
              <View style={[styles.attachIconCircle, {backgroundColor: '#C861FA'}]}>
                <Image source={imageForChat} style={styles.attachIcon} />
              </View>
              <Text style={styles.attachLabel}>Images</Text>
            </GestureTouchableOpacity>
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
                style={{ width: '90%', height: '70%', borderRadius: 12, resizeMode: 'contain' }}
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
    elevation: 5,
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
    elevation: 4,
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
    padding: 20,
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
    elevation: 8,
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
});