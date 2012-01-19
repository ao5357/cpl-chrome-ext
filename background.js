function showNotification(notifBody){
	var notifTitle = chrome.i18n.getMessage("notificationBrief");
	var notification = window.webkitNotifications.createNotification('',notifTitle,notifBody);
	notification.show();
	}

var testNotif = isbns.join();
showNotification(testNotif);