//Known issues:
//1. When page "flip" is activated after accelerating a touch event,
// a double acceleration glitch occurs when flipping to the back page

//optimize for minification and performance
(function(window,document,undefined){

    var slidfast = (function(){

        var slidfast = function(startupOptions){
            options = startupOptions;
            return new slidfast.core.init();
        },

        options,

        defaultPageID = "",

        touchEnabled = false,

        focusPage =  null,

        isReady = false,

        flipped = false;

        slidfast.core = slidfast.prototype = {
            constructor: slidfast,

            start: function() {
                if(options){
                    defaultPageID = options.defaultPageID;
                    touchEnabled = options.touchEnabled;
                }
                try{
                    slidfast.core.hideURLBar();

                    if(touchEnabled){
                        new slidfast.ui.Touch(getElement(defaultPageID));
                    }

                }catch(e){
                    alert('You must define the page ID as default parameters. \n Error:' + e)
                }
            },

            hideURLBar: function() {
                //hide the url bar on mobile devices
                setTimeout(scrollTo, 0, 0, 1)
            },

            init: function() {

                window.addEventListener('load', function(e) {
                    isReady = true;
                    slidfast.core.start(defaultPageID, touchEnabled);
                }, false);

                return slidfast.core;

            }

        };

        slidfast.core.init.prototype = slidfast.core;

        slidfast.ui = slidfast.prototype = {

            slideTo : function(id) {

                if(!focusPage) {
                    focusPage = getElement(defaultPageID);
                }

                //1.)the page we are bringing into focus dictates how
                // the current page will exit. So let's see what classes
                // our incoming page is using. We know it will have stage[right|left|etc...]
                var classes = getElement(id).className.split(' ');

                //2.)decide if the incoming page is assigned to right or left
                // (-1 if no match)
                var stageType = classes.indexOf('stage-left');

                //3a.)Flip if needed
                var front = getElement('front');
                if(front){
                    var frontNodes = front.getElementsByTagName('*');
                    var i;
                    for (i = 0; i < frontNodes.length; i += 1) {
                        if(focusPage.id == frontNodes[i].id && flipped){
                           slidfast.ui.flip();
                        }
                    }
                }

                //3b.) decide how this focused page should exit.
                if (stageType > 0) {
                    focusPage.className = 'page transition stage-right';
                } else {
                    focusPage.className = 'page transition stage-left';
                }

                //4. refresh/set the variable
                focusPage = document.getElementById(id);

                //5. Bring in the new page.
                focusPage.className = 'page transition stage-center';

                if(touchEnabled){
                    new slidfast.ui.Touch(focusPage);
                }

            },


            flip : function() {
                //get a handle on the flippable region
                var front = document.getElementById('front');
                var back = document.getElementById('back');

                //just a simple way to see what the state is
                var classes = front.className.split(' ');
                var flippedClass = classes.indexOf('flipped');

                if (flippedClass >= 0) {
                    //already flipped, so return to original
                    front.className = 'normal';
                    back.className = 'flipped';
                    flipped = false;
                } else {
                    //do the flip
                    front.className = 'flipped';
                    back.className = 'normal';
                    flipped = true;
                }
            },

            Touch : function(e) {
                var page = e;
                //todo - tie to markup for now
                var track = document.getElementById("page-container");
                var currentPos = page.style.left;

                var originalTouch = 0;

                var slideDirection = null;
                var cancel = false;
                var swipeThreshold = 201;

                var swipeTime;
                var timer;
                var maxPos;

                function pageMove(event) {
                    //get position after transform
                    var curTransform = new WebKitCSSMatrix(window.getComputedStyle(page).webkitTransform);
                    var pagePosition = curTransform.m41;

                    //make sure finger is not released
                    if(event.type != 'touchend'){
                        //holder for current x position
                        var currentTouch = event.touches[0].clientX;

                        if(event.type == 'touchstart'){
                            //reset measurement to 0 each time a new touch begins
                            originalTouch = event.touches[0].clientX;
                            timer = timerStart();
                        }

                        //get the difference between where we are now vs. where we started on first touch
                        currentPos = currentTouch - originalTouch;

                        //figure out if we are cancelling the swipe event
                        //simple gauge for finding the highest positive or negative number
                        if(pagePosition < 0){
                           if(maxPos < pagePosition) {
                                cancel = true;
                            }else{
                                maxPos = pagePosition;
                            }
                        }else{
                            if(maxPos > pagePosition) {
                                cancel = true;
                            }else {
                                maxPos = pagePosition;
                            }
                        }

                    }else{
                        //touch event comes to an end
                        swipeTime = timerEnd(timer,'numbers2');
                        currentPos = 0;

                        //how far do we go before a page flip occurs
                        var pageFlipThreshold = 75;

                        if(!cancel){
                            //find out which direction we're going on x axis
                            if(pagePosition >= 0){
                            //moving current page to the right
                            //so means we're flipping backwards
                               if((pagePosition > pageFlipThreshold) || (swipeTime < swipeThreshold)){
                                   //user wants to go backward
                                   slideDirection = 'right';
                                }else{
                                   slideDirection = null;
                                }
                            }else{
                            //current page is sliding to the left
                                if((swipeTime < swipeThreshold) || (pagePosition < pageFlipThreshold)){
                                   //user wants to go forward
                                   slideDirection = 'left';
                                }else{
                                   slideDirection = null;
                                }

                            }
                        }
                        maxPos = 0;
                        cancel = false;
                    }

                    positionPage();
                }

                function positionPage(end){
                    page.style.webkitTransform = 'translate3d('+ currentPos + 'px, 0, 0)';
                    if(end){
                        page.style.WebkitTransition = 'all .4s ease-out';
                        //page.style.WebkitTransition = 'all .4s cubic-bezier(0,.58,.58,1)'
                    }else{
                        page.style.WebkitTransition = 'all .2s ease-out';
                    }
                    page.style.WebkitUserSelect = 'none';
                }

                track.ontouchstart = function(event) {
                //alert(event.touches[0].clientX);
                    pageMove(event);
                };
                track.ontouchmove = function(event) {
                    event.preventDefault();
                    pageMove(event);
                };
                track.ontouchend = function(event) {
                    pageMove(event);
                    if(slideDirection == 'left'){
                       slidfast.ui.slideTo('products-page');
                    }else if (slideDirection == 'right'){
                       slidfast.ui.slideTo('home-page');
                    }
                };

                positionPage(true);

            }



        };


        var getElement = function(id) {
            return document.getElementById(id)
        };

        var timerStart = function() {
            return (new Date()).getTime();
        };

        var timerEnd = function(start, id) {
            return ((new Date()).getTime() - start);
        };

        var log = function(statement){
            var log = getElement('log');
            var currentText = log.innerHTML;
            log.innerHTML = (new Date()).toTimeString() + ': ' + statement + '<br/>' + currentText;
        };


        return slidfast;

    })();

window.slidfast = slidfast;
})(window,document);



