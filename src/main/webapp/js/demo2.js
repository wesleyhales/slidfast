//    demo2----------------------------caching and fetching
function supports_local_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


var getUnconvertedLinks = function(node,classname){
    //iterate through all nodes in this DOM to find all mobile pages we care about
    var links = new Array;
    var pages = node.getElementsByClassName('page');
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
                !(/[\#]/g).test(link.href)) {
                //check for an explicit class name setting to filter this link
                if (classname != null) {
                    if(link.className.indexOf(classname) >= 0)  {
                          links.push(link);
                    }
                }else if (classname == null && link.className == ''){
                //return unfiltered list
                      links.push(link);
                }


            }
        }
    }
    return links;
};


var fetchAndCache = function(async) {
    var links = getUnconvertedLinks(document,'fetch');

    var i;
    for (i = 0; i < links.length; i += 1) {
         var ai = new ajax(links[i],function(text,url){
              //insert the new mobile page into the DOM
             insertPages(text,url);
         },async);
         ai.doGet();
    }
};

function cacheExternalImage(url) {
    var img = new Image(); // width, height values are optional params
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

function ajax(url, callback, async) {
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
                try{
                    localStorage[url] = req.responseText;
                }catch(e){
                    if (e.name == 'QUOTA_EXCEEDED_ERR') {
                        //write this markup to a server-side
                        //cache or extension of localStorage
                         alert('Quota exceeded!');
                    }
                }
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
       req.open("GET",  url + "?timestamp=" + new Date().getTime(), async);
       req.send(null);

    }

    this.doPost = function(body) {
      req.open("POST", url, async);
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
    //helper for onlcick below
    var onclickHelper = function(e){
        return function(f) {
            slideTo(e);
        }
    };
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
        if(originalLink.onclick == null){
            //todo set the href for ajax bookmark (override back button)
            originalLink.setAttribute('href', '#');
            //set the original link for transition
            originalLink.onclick = onclickHelper(newPage.id);
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

