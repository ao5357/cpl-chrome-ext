#CPL Chrome Extension

##Features
The extension does two things:
1. Finds ISBNs on pages and finds out if Canton Public Library has the book in its catalog
2. Installs an omnibox keyword with as-you-type suggestions

##Background
As the commit history demonstrates, the original CPL Catalog extension implemented similar features, albeit poorly, using a browser action with popup. The algorithm for finding and sorting ISBNs would jumble everything up and it was a awful (and slow!) mess if it worked at all. The search feature worked well, but it wasn't integrated into the omnibox, so it didn't get nearly as much use as hoped.

This version takes advantage of newer extension APIs in order to take up less default space, while being a bit more visible when it counts. It also uses a simple-yet-clever algorithm to accurately pick the right ISBN from the page on most of the common book-related sites.

##Privacy
The repo you see here is exactly the code packed into the extension. The important thing to know about how we keep your information private is this: the only data sent from your computer to the library are ISBNs and the HTTP headers that get sent to every website you visit. ISBNs are 10-13-digit numbers that are not personally-identifiable in any way. We store your IP address along with the ISBN number in our cache for exactly 24 hours, then delete it.
Whether you're familiar with JavaScript or not, here's an overview of what the Extension files do, and how they handle private browsing data:

###manifest.json
All extensions use a manifest.json file to provide information to Chrome about what the extension is. It specifies which permissions are required (we ask for "tabs" and "omnibox", meaning the extension can manipulate browser tabs and the address bar) and which pages it can access (we request *all* sites when in non-incognito mode).

###notifications.js
This relatively-small script is the only thing interacting with your browsing data: it is injected into every page you visit. It searches the content of pages you visit *only* for 10-and-13-digit numbers. It then determines whether those numbers are valid ISBNs from English-speaking countries. Finally, it ranks all the ISBNs found by how often they appear on the page and where. The highest-ranked ISBN is then sent to background.html

###background.html
This page is open all the time in the background when you open Chrome. It receives the top-ranked ISBNs from notifications.js and searches the CPL Catalog to see if the library has a copy. If it does, the background page tells Chrome to pop up a notification for you. This page also talks to (and does stuff in) the address bar whenever you activate the keyword "cpl". This process will send your search term to the CPL server in order to provide you with suggestions as you type.

###notification.html
This is the template for the notification that pops up. It calls home to background.html to get its content.

##For Developers
Most of the implementation is pretty standard stuff. One interesting problem that this extension solves, though, is HTML Notifications. HTML Notifications as spec'd in HTML5 take a URL as an argument, while text notifications take the target notification's content. We wanted the simplicity of text Notifications but the additional capabilities of HTML notifications; all while using the included static extension files.

To accomplish this, background.html first creates a timestamp that's used to uniquely identify a particular notification. This key is the property id of an object attached to the window. When the Extension is built, its URL is appended with the key as a hash. Once the notification loads, it retrieves the hash, calls home to the background page, retrieves the data it needs from the window object, then builds itself.

The extension also features a lightweight jQuery-flavored script for providing suggestions in the omnibox. This isn't a particularly common feature for extensions to implement, but is easy enough to accomplish.