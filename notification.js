jQuery(document).ready(function($){
// retrieve the body content pre-built by the background page
var notifStamp = window.location.hash.substr(1);
notifBody = chrome.extension.getBackgroundPage().notificationData[notifStamp];
document.body.innerHTML = notifBody;

// make clicking on links open them in a new tab
$("a").on("click",function(e){
	chrome.tabs.create({url: $(this).attr("href"),selected: false});
	});
});