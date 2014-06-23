$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var maxID = 0;
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    var newestDate = new Date();
    var oldestDate = new Date();
    oldestDate.setDate(oldestDate.getDate() - 7);
    var allResults = '';
    var gatherMore = true;
    $('.loader').toggle();
    $('#tblResult').toggle();
    $('#timeSpent').toggle();
    $('#btnExport').toggle();
    $('.export').toggle();
    $('#toDate').attr('disabled', '');

    $("#fromDate").datepicker({
        minDate: -7,
        maxDate: 0,
        showAnim: 'clip',
        onSelect: function () {
            var fromDate = new Date($('#fromDate').val());
            $('#toDate').removeAttr('disabled');
            $('#toDate').datepicker('option', 'minDate', Math.floor((fromDate - new Date()) / (1000 * 3600 * 24)) + 1);
        }
    }).datepicker('setDate', oldestDate);

    $('#toDate').datepicker({
        minDate: 0,
        maxDate: 0        
    }).datepicker('setDate', new Date());

    $('button.search-button').click(function () {
        $('.loader').toggle();
        $('.glyphicon-search').toggle();
        $('.search-button').addClass('disabled');
        query = $('#search_term').val();

        var toDate = (new Date()).valueOf() + 86400000;
        var fromDate = (new Date()).valueOf() - 691200000;

        if ($('#toDate').val() != "")
            toDate = new Date($('#toDate').val() + ' ' + $('#toTime').val()).valueOf();

        if ($('#fromDate').val() != "")
            fromDate = new Date($('#fromDate').val() + ' ' + $('#fromTime').val()).valueOf();
        
        $.ajax('/api/gettweets', {
            method: 'GET',
            data: { 'query': query, 'maxID': maxID, 'toDate': $('#toDate').val() + ' ' + $('#toTime').val(), 'fromDate': $('#fromDate').val() + ' ' + $('#fromTime').val(), 'export': 'Yes' },
            statusCode: {
                500: function () {
                    console.log('I need to rest for a little while...');                    
                }
            }, success: function (data) {
                $('#count').html(data).addClass('alert-success');
            }, fail: function (data) {
                gatherMore = false;
                $('#count').html('Error encountered. Please refresh the page and search again').addClass('alert-danger').removeClass('alert-success');
            }
        }).done(function () {
            console.log("false and done");
            $('.loader').hide();
            $('.glyphicon-search').show();
            $('.search-button').removeClass('disabled');
        });
    });
});