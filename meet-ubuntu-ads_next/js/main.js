(function(){
    var imp = impress();
    imp.init();
    var el = document.querySelector('#arrowLeft');
    el.addEventListener('click', function(e){
            imp.prev();
            e.preventDefault();

    },false);
    el = document.querySelector('#arrowRight');
    el.addEventListener('click', function(e){
        imp.next();
        e.preventDefault();
    },false);
})();
