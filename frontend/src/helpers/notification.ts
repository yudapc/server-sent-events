export const requestNotificationPermission = () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return;
  }
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
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return;
  }
  console.log('showNotification Notification.permission: ', Notification.permission);
  // if (Notification.permission === 'granted') {
  new Notification(title, options);
  // }
};
