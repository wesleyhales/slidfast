//demo1----------------------------slide/flip transition

var FOCUS_PAGE = getElement('home-page');
var FLIPPED = false;
function hideURLbar() {
    setTimeout(scrollTo, 0, 0, 1);
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