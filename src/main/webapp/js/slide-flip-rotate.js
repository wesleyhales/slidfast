
//demo1----------------------------slide/flip transition

var FOCUS_PAGE = getElement('home-page');
var FLIPPED = false;
function hideURLbar() {
    setTimeout(scrollTo, 0, 0, 1);
}

{
  window.addEventListener('load', function(e) {
   //todo - check to see if one already exists for that page
    new Slider("page-container", "sliderFill", "home-page", 100, 0,null);
  }, false);
}

function slideTo(target) {

    var target = getElement(target);
    //1.)the page we are bringing into focus dictates how
    // the current page will exit. So let's see what classes
    // our incoming page is using. We know it will have stage[right|left|etc...]
    var classes = target.className.split(' ');

    //2.)decide if the incoming page is assigned to right or left
    // (-1 if no match)
    var stageType = classes.indexOf('stage-left');

    //3.) on initial page load focusPage is null, so we need
    // to set the default page which we're currently seeing.
    if (FOCUS_PAGE == null) {
        //use home page
        FOCUS_PAGE = getElement('home-page');
    }

    //3a.)Flip if needed
    var frontNodes = document.getElementById('front').getElementsByTagName('*');
    var i;
    for (i = 0; i < frontNodes.length; i += 1) {
        if(target.id == frontNodes[i].id && FLIPPED){
           flip();
        }
    }
    //4.) decide how this focused page should exit.
    if (stageType > 0) {
        FOCUS_PAGE.className = 'page transition stage-right';
    } else {
        FOCUS_PAGE.className = 'page transition stage-left';
    }

    //5. refresh/set the global variable
    FOCUS_PAGE = target;

    //6. Bring in the new page.
    FOCUS_PAGE.className = 'page transition stage-center';

    //todo - check to see if one already exists for that page
    new Slider("page-container", "sliderFill", FOCUS_PAGE.id, 100, 0,null);
}

function flip(id) {               9
    //get a handle on the flippable region
    var front = getElement('front');
    var back = getElement('back');

    //again, just a simple way to see what the state is
    var classes = front.className.split(' ');
    var flipped = classes.indexOf('flipped');

    if (flipped >= 0) {
        //already flipped, so return to original
        front.className = 'normal';
        back.className = 'flipped';
        FLIPPED = false;
    } else {
        //do the flip
        front.className = 'flipped';
        back.className = 'normal';
        FLIPPED = true;
    }
}

function Slider(track, backfill, page, maxRange, currentPos,callback)
{
    track = document.getElementById(track);
    backfill = document.getElementById(backfill);
    page = document.getElementById(page);
    currentPos = page.style.left;

    var thumbWidth = 20;
    var borderWidth = 10;

    var originalTouch = 0;
    var originalX = 0;

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

    function positionPage(end)
    {
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
    }
    track.ontouchmove = function(event) {
        event.preventDefault();
        pageMove(event);
    }
    track.ontouchend = function(event) {
        pageMove(event);
        if(slideDirection == 'left'){
           slideTo('products-page');
        }else if (slideDirection == 'right'){
            slideTo('home-page');
        }
    }

    positionPage(true);
}

//    demo1----------------------------end slide/flip transition

function getElement(id) {
    return document.getElementById(id)
}

function timerStart() {
    return (new Date()).getTime();
}

function timerEnd(start, id) {
    return ((new Date()).getTime() - start);
}

function log(statement){
    var log = getElement('log');
    var currentText = log.innerHTML;
    log.innerHTML = (new Date()).toTimeString() + ': ' + statement + '<br/>' + currentText;
}