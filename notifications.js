// ISBN validator with slight mods: http://jsfiddle.net/ao5357/kcN2f/
String.prototype.valI = function(){var a=this,b=0,i=0,l=a.length;if(l==10 && (a[0] == 0 || a[0] == 1)){var c=a[9]=='X'?10:a[9]*1;for(i;i<9;i++){b+=a[i]*(10-i)}return (b+c)%11==0?a:0}if(l==13){var c=a[12]==0?10:a[12]*1;for(i;i<12;i++){b+=(i+1)%2==0?a[i]*3:a[i]*1}return 10-(b%10)==c?a:0}};

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
contents = contents.match(/(97[89][0-9]{10}|[0-9]{10}|[0-9]{9}[xX])/ig);
for(var i in contents){
	if(contents[i].valI() && !isbns[contents[i]] && badMatches.indexOf(contents[i]) == -1){
		isbns[contents[i]] = 1;
		}
	else if(contents[i].valI() && isbns[contents[i]]){
		isbns[contents[i]]++;
		}
	}

// send top result if there is one and it's worthwhile (English zoned)
if(Object.keys(isbns).length >= 1){
	var flipped = String(flipSort(isbns)[0]);
	chrome.extension.sendRequest({isbn: flipped});
	}