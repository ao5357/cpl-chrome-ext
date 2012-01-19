function showNotification(notifBody){
	var notifIcon = chrome.extension.getURL("icon48.png");
	var notifTitle = chrome.i18n.getMessage("notificationBrief");
	var notification = window.webkitNotifications.createNotification(notifIcon,notifTitle,notifBody);
	notification.show();
	}

chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	if(request.isbns[0]){
		var testNotif = request.isbns.join();
		showNotification(testNotif);
		}
	});