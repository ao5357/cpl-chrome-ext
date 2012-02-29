jQuery(document).ready(function($){
/* Page ISBN notifications */
window.notificationData = new Array();
document.sessionISBNs = new Array();
document.notifIcon = chrome.extension.getURL("icon16.png");
document.notifTitle = chrome.i18n.getMessage("notificationBrief");
document.defaultSuggestion = chrome.i18n.getMessage("defaultSuggestion");
document.searchingSuggestion = chrome.i18n.getMessage("searchingSuggestion");
document.resultsSuggestion = chrome.i18n.getMessage("resultsSuggestion");

// builds an HTML5 notification bound to a hash
function showNotification(notifStamp){
	var notifLoc = chrome.extension.getURL("notification.html") + '#' + notifStamp;
	var notification = window.webkitNotifications.createHTMLNotification(notifLoc);
	notification.onclose = function(){delete window.notificationData[notifStamp];};
	notification.onerror = function(){delete window.notificationData[notifStamp];};
	notification.show();
	setTimeout(function(){notification.cancel()},15000);
	}

// query exact and edition ISBNs for CPL holdings
function cplQuery(isbn,notifStamp){
	$.getJSON('https://www.cantonpl.org/apis/cat.php?type=i&callback=?',{q: isbn},function(data){
			window.notificationData[notifStamp] = resultFormatter(data["0"]);
			showNotification(notifStamp);
			})
		.error(function(){
			$.getJSON('https://www.cantonpl.org/apis/frbr.php?callback=?',{i: isbn,results: 1},function(data){
					window.notificationData[notifStamp] = resultFormatter(data["0"]);
					showNotification(notifStamp);
				});
			});
	}

// turn a catalog API result object into a link with a jacket and stuff
function resultFormatter(result){
	var output = '<img class="icon" src="' + document.notifIcon + '" /><strong>' + document.notifTitle + '</strong>';
	output += '<a href="http://catalog.cantonpl.org/record=' + result.bnum + '" class="result"><span class="jacket">';
	if(result.isbn){output += '<img width="37" height="50" alt="" src="http://www.syndetics.com/index.aspx?isbn=' + result.isbn[0] + '/SC.GIF&amp;client=cant&amp;showCaptionBelow=f">';}
	output += '</span>';
	if(result.title){output += '<span class="title">' + result.title.split(' /',1)[0].substring(0,40) + '</span>';}
	if(result.author){output += '<span class="author">' + result.author.substring(0,40) + '</span>';}
	output += '</a>';
	return output;
	}

// listen for content scripts to send isbns over
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	var notifStamp = new Date().getTime();
	if(document.sessionISBNs.indexOf(request.isbn) == -1){
		cplQuery(request.isbn,notifStamp);
		document.sessionISBNs.push(request.isbn);
		}
	});

/* Omnibox Suggestions */
var t = 0;
chrome.omnibox.onInputChanged.addListener(function(text,suggest){
	clearTimeout(t);
	var defaultSuggestion = (text.length >= 4) ? {description: document.searchingSuggestion + ": <match>%s</match>"} : {description: document.defaultSuggestion};
	chrome.omnibox.setDefaultSuggestion(defaultSuggestion);

	t = setTimeout(function(){
		if(text.length >= 4){
		var results = new Array();
		$.getJSON('https://www.cantonpl.org/apis/cat.php?type=t&callback=?',{q: text},function(data){
			delete data.type;
			$.each(data,function(i,item){
				var title = $("<div/>").text(item.title).html(), openBrace = title.indexOf('['), slash = title.indexOf('/');
					if(openBrace == -1 && slash >= 1){title = title.substr(0,slash);}
					else if(slash == -1 && openBrace >= 1){title = title.substr(0,openBrace);}
					else if(slash >= 1 && openBrace >= 1 && openBrace < slash){title = title.substr(0,openBrace);}
					else if(slash >= 1 && openBrace >= 1 && slash < openBrace){title = title.substr(0,slash);}
				var bar = "http://catalog.cantonpl.org/record=" + item.bnum;
				var description = title + " <url>" + bar + "</url>";
				results.push({content: bar, description: description});
				});
			chrome.omnibox.setDefaultSuggestion({description: document.resultsSuggestion + ": <match>%s</match>"});
			suggest(results);
			});
			}
		},300);
	});

chrome.omnibox.onInputEntered.addListener(function(text){
	chrome.tabs.getSelected(null,function(tab){
		if(text.substr(0,7) == "http://"){
			chrome.tabs.update(tab.id,{url: text});
			}
		else{
			chrome.tabs.update(tab.id,{url: "http://catalog.cantonpl.org/search/X" + encodeURIComponent(text)});
			}
		});
	});
});