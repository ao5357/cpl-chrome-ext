// Tiny, ugly ISBN validator: http://jsfiddle.net/ao5357/kcN2f/
function v(a){var b=i=r=0,t=10,l=a.length;if(l==t){for(i;i<9;i++)b+=a[i]*(t-i);r=(b+(a[9]=='X'?t:a[9]))%11==0}if(l==13){for(i;i<12;i++)b+=(i+1)%2?+a[i]:a[i]*3;r=b%t==t-(+a[12]||t)}return r?a:0}

// sort descending: takes original order into account [as much as possible]
function sortProps(a,b){
	var c = b.weight - a.weight;
	return (c == 0) ? b.index - a.index : c;
	}
// object to array -> sort -> return top result
function flipSort(obj){
	var objArr = new Array(), isbnArr = new Array(), index = 0;
	for(var i in obj){objArr.push({isbn: i,weight: obj[i],index: index});index++;}
	objArr.sort(sortProps);
	isbnArr.push(objArr[0].isbn);
	return isbnArr;
	}

// find isbn-like numbers on the page
var isbns = new Object(), contents = document.body.innerHTML, badMatches = ["0000000000","0123456789"];
contents = contents.replace(/[\- \.]/ig,"");
contents = contents.match(/(97[89][0-9]{10}|[01][0-9]{9}|[01][0-9]{8}[xX])/ig);
for(var i in contents){
	if(v(contents[i]) && !isbns[contents[i]] && badMatches.indexOf(contents[i]) == -1){
		isbns[contents[i]] = 1;
		}
	else if(v(contents[i]) && isbns[contents[i]]){
		isbns[contents[i]]++;
		}
	}

// send top result if there is one and it's worthwhile (English zoned)
if(Object.keys(isbns).length >= 1 && location.hostname.slice(-12) !== "cantonpl.org"){
	var flipped = String(flipSort(isbns)[0]);
	chrome.extension.sendRequest({isbn: flipped});
	}
else if(location.hostname.slice(-12) === "cantonpl.org"){
	var actionBar = document.getElementById("action-bar");
	var chromeButton = document.getElementById('chrome-extension');
	actionBar.removeChild(chromeButton);
	}