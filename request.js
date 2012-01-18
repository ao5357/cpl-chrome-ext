function unique(a){a.sort();for(var i = 1;i < a.length;){if(a[i-1] == a[i]){a.splice(i,1);}else{i++;}}return a;}
function validateISBN(a){a=a.toString();if(a.length==10){var b=0;var c=a.charAt(9);if(c=='x'||c=='X'){c=10}var i=0;while(i<=8){b=b+(a.charAt(i)*(10-i));i++}b=b+(c*1);if((b%11)==0){return"true"}else{return"false"}}else if(a.length==13){var b=0;var c=(a.charAt(12)*1);if(c==0){c=10}var i=0;while(i<=11){j=i+1;if(j%2==0){b=b+(a.charAt(i)*3)}else{b=b+(a.charAt(i)*1)}i++}b=b%10;b=10-b;if(b==c){return"true"}else{return"false"}}else{return"false"}}

var isbns = new Array();
var contents = document.body.innerHTML;
	contents = contents.replace(/[\- \.]/ig,"");
	contents = contents.match(/(97[89][0-9]{10}|[0-9]{10}|[0-9]{9}[x])/ig);
	for(x in contents){
		if(validateISBN(contents[x]) == "true"){
			isbns.push(contents[x]);
			}
		}
isbns = unique(isbns);
chrome.extension.sendRequest({isbns: isbns});