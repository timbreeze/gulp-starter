function navToggleBurger() {
    var burger = '.burger-icon';
    $('.navbar-toggle').on('click', function() {
        if ( $(burger).hasClass('is-active') ) {
            $(burger).removeClass('is-active');
        } else {
            $(burger).addClass('is-active');
        }
    });
}

$(document).ready(function() {
    // Controls animation of mobile burger icon
    navToggleBurger();   
});