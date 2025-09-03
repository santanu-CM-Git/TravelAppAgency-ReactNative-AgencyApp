# Notification Popup Feature

## Overview
This feature implements a popup notification system that displays when push notifications arrive while the app is already open (foreground state).

## Features
- **Foreground Notification Popup**: Shows a beautiful animated popup when notifications arrive while the app is open
- **Queue System**: Handles multiple notifications by queuing them and showing them sequentially
- **Auto-dismiss**: Automatically hides after 5 seconds
- **Manual Dismiss**: Users can manually close the popup
- **Action Support**: Includes a "View" button to handle notification actions
- **Vibration Feedback**: Provides haptic feedback when notifications appear
- **Responsive Design**: Adapts to different screen sizes and orientations

## Components

### NotificationPopup Component
Located at: `src/components/NotificationPopup.js`

**Props:**
- `isVisible`: Boolean to control popup visibility
- `notification`: The notification object to display
- `onClose`: Callback function when popup is closed
- `onAction`: Callback function when action button is pressed

**Features:**
- Slide-in animation from left
- Auto-hide after 5 seconds
- Manual close button
- Action button for handling notifications
- Vibration feedback
- Responsive design

### Integration in App.js
The notification popup is integrated into the main App component with:
- State management for popup visibility and current notification
- Queue system for handling multiple notifications
- Integration with Firebase messaging for foreground notifications

## How It Works

1. **Notification Arrival**: When a push notification arrives while the app is open
2. **ChatScreen Filter**: The system first checks if the notification is for ChatScreen (`remoteMessage?.data?.screen === 'ChatScreen'`)
3. **Current Screen Check**: If it's a ChatScreen notification, the system checks if the user is already on ChatScreen
4. **Popup Display**: If it's a ChatScreen notification and user is NOT on ChatScreen, the popup slides in from the left with animation
5. **User Interaction**: Users can either:
   - Wait for auto-dismiss (10 seconds)
   - Manually close the popup
   - Press the "View" button to navigate to ChatScreen
6. **Queue Processing**: If multiple ChatScreen notifications arrive, they are queued and shown sequentially

## Smart Notification Filtering

The notification popup system includes intelligent filtering to show only relevant notifications:

- **ChatScreen Only**: The popup **only** displays for notifications where `remoteMessage?.data?.screen === 'ChatScreen'`
- **ChatScreen Detection**: If the user is currently on the ChatScreen, the popup is skipped since ChatScreen handles its own notifications
- **All Other Notifications Skipped**: Notifications for other screens (like 'ScheduleScreen', 'WalletScreen', etc.) are automatically skipped
- **Nested Navigation Support**: The system properly detects ChatScreen even when nested within other navigators

## Notification Data Structure

The popup supports various notification formats:

```javascript
// Standard Firebase notification
{
  notification: {
    title: "Notification Title",
    body: "Notification message body"
  },
  data: {
    screen: "ScheduleScreen",
    // ... other custom data
  }
}

// Custom data format
{
  data: {
    title: "Custom Title",
    body: "Custom message",
    screen: "WalletScreen"
  }
}
```

## Customization

### Styling
The popup appearance can be customized by modifying the styles in `NotificationPopup.js`:
- Colors, fonts, and spacing
- Animation duration and timing
- Popup size and positioning

### Behavior
- Auto-dismiss timeout (currently 10 seconds)
- Vibration pattern
- Animation effects
- Smart filtering for ChatScreen notifications

## Usage Example

```javascript
import NotificationPopup from './src/components/NotificationPopup';

// In your component
<NotificationPopup
  isVisible={showNotificationPopup}
  notification={currentNotification}
  onClose={() => setShowNotificationPopup(false)}
  onAction={(notification) => {
    // Handle notification action
    console.log('Notification action:', notification);
  }}
/>
```

## Dependencies

- `react-native-modal`: For the popup modal
- `react-native-vector-icons`: For icons
- `@react-native-firebase/messaging`: For push notifications

## Testing

To test the notification popup:

1. **Foreground Testing**: Send a push notification while the app is open
2. **Multiple Notifications**: Send multiple notifications quickly to test the queue system
3. **Action Testing**: Test the "View" button functionality
4. **Auto-dismiss**: Verify the popup automatically hides after 5 seconds

## Troubleshooting

### Common Issues:
1. **Popup not showing**: Check if `isVisible` state is properly set
2. **Animation issues**: Verify `react-native-modal` is properly installed
3. **Icon not displaying**: Ensure `react-native-vector-icons` is configured correctly

### Debug Tips:
- Check console logs for notification data
- Verify Firebase messaging permissions
- Test with different notification payloads

## Future Enhancements

Potential improvements:
- Sound effects for notifications
- Custom notification types (success, warning, error)
- Rich media support (images, videos)
- Advanced animation options
- Notification history
- User preferences for notification behavior
