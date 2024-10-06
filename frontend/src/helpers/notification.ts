export const requestNotificationPermission = () => {
  console.log('Notification.permission: ', Notification.permission);
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
    }
  });
};

// Show notification
export const showNotification = (title: any, options: any) => {
  console.log('showNotification Notification.permission: ', Notification.permission);
  // if (Notification.permission === 'granted') {
    new Notification(title, options);
  // }
};