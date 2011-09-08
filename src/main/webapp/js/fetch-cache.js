//    demo2----------------------------caching and fetching
function supports_local_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

var fetchAndCache = function() {
    //iterate through all nodes in this DOM to find all mobile pages we care about
    var pages = document.getElementsByClassName('page');
    var i;
    for (i = 0; i < pages.length; i += 1) {
        //find all links
        var pageLinks = pages[i].getElementsByTagName('a');
        var j;
        for (j = 0; j < pageLinks.length; j += 1) {
            var link = pageLinks[j];

            if (link.hasAttribute('href') &&
            //'#' in the href tells us that this page is already loaded in the dom - and
            // that it links to a mobile transition/page
                !(/[\#]/g).test(link.href) &&
                //check for an explicit class name setting to fetch this link
                (link.className.indexOf('fetch') >= 0))  {
                 //fetch each url concurrently
                 var ai = new ajax(link,function(text,url){
                      //insert the new mobile page into the DOM
                     insertPages(text,url);
                 });
                 ai.doGet();
            }
        }
    }
};

function cacheExternalImage(url) {
    var img = new Image(); // width, height values are optional params
    //http://blog.chromium.org/2011/07/using-cross-domain-images-in-webgl-and.html
    //remote server has to support CORS
    img.crossOrigin = '';
    img.src = url;
    img.onload = function() {
        if(img.complete){
            //this is where you could proxy server side
            load(img);
        }
    }
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0,0);
    img.src = ctx.canvas.toDataURL("image/png");
    return img
}

function ajax(url, callback) {

    var req = init();
    req.onreadystatechange = processRequest;

    function init() {
      if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    }

    function processRequest () {
      if (req.readyState == 4) {
        if (req.status == 200) {
            if (supports_local_storage()) {
                localStorage[url] = req.responseText;
            }
            if (callback) callback(req.responseText,url);
        }else {
          // There is an error of some kind, use our cached copy (if available).
          if (!!localStorage[url]) {
            // We have some data cached, return that to the callback.
            callback(localStorage[url],url);
            return;
          }
        }
      }
    }

    this.doGet = function() {
      req.open("GET", url, true);
      req.send(null);
    }

    this.doPost = function(body) {
      req.open("POST", url, true);
      req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      req.send(body);
    }
}

var count = 0;
var insertPages = function(text, originalLink) {
    var frame = getFrame();
    //write the ajax response text to the frame and let
    //the browser do the work
    frame.write(text);

    //now we have a DOM to work with
    var incomingPages = frame.getElementsByClassName('page');

    var i;
    var pageCount = incomingPages.length;
    for (i = 0; i < pageCount; i += 1) {
        //the new page will always be at index 0 because
        //the last one just got popped off the stack with appendChild (below)
        //todo - handle better
        var newPage = incomingPages[0];
        //stage the new pages to the left by default
        //(todo check for predefined stage class)
        newPage.className = 'page stage-left';

        //find out where to insert
        var location = newPage.parentNode.id == 'back' ? 'back' : 'front';
        //alert();
        try{
            //mobile safari will not allow nodes to be transferred from one DOM to another so
            //we must use adoptNode()
            document.getElementById(location).appendChild(document.adoptNode(newPage));
        }catch(e){
            //todo graceful degradation?
        }
        //this is where prefetching multiple "mobile" pages embedded in a single html page gets tricky.
        //we may have N embedded pages, so how do we know which node/page this should link/slide to?
        //for now we'll assume the first *-page in the "front" node is where this links to.
        if(originalLink.getAttribute('onclick') == null){
            //set the original link for transition
            originalLink.setAttribute('onclick', 'slideTo(\'' + newPage.id + '\')');
            //todo set the href for ajax bookmark (override back button)
            originalLink.setAttribute('href', '#');
        }
    }
}


function getFrame() {
    var frame = document.getElementById("temp-frame");

    if (!frame) {
        // create frame
        frame = document.createElement("iframe");
        frame.setAttribute("id", "temp-frame");
        frame.setAttribute("name", "temp-frame");
        frame.setAttribute("seamless", "");
        frame.setAttribute("sandbox", "");
        frame.style.display = 'none';
        document.documentElement.appendChild(frame);
    }
    // load a page
    return frame.contentDocument;
}
//    demo2----------------------------end caching and fetching

