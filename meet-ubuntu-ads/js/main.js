$(function(){
    var imp = impress();
    imp.init();
    $('#arrowLeft').click(function(e){
        imp.prev();
        e.preventDefault();

    });	
    $('#arrowRight').click(function(e){
        imp.next();
        e.preventDefault();
    });
});
