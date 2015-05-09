function scroll(el) {
        $('html,body').animate({
            scrollTop: $(el).position().top},
        'slow');
};
