$(document).ready(function() {

    $.get('api/news');

    $('.update-button').on('click', function() {
        $.get('api/news');
    });

    $('.delete-button').on('click', function () {
        $.get('api/delete');
    })
});