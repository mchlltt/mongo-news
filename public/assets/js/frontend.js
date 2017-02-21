$(document).ready(function() {

    $('.update-button').on('click', function() {
        $.get('api/news');
    });

    $('.delete-button').on('click', function () {
        $.get('api/delete');
    })
});