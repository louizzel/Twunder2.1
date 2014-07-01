$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var maxID = 0;
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    var newestDate = new Date();
    var oldestDate = new Date();
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
    });

    $('#toDate').datepicker({
        minDate: 0,
        maxDate: 0
    });

    $('.glyphicon-search').click(function () {
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

        var gather = setInterval(function () {
            if (gatherMore) {
                gatherMore = false;
                $.ajax('/api/gettweets', {
                    method: 'GET',
                    data: { 'query': query, 'maxID': maxID, 'toDate': $('#toDate').val(), 'fromDate': $('#fromDate').val() },
                    statusCode: {
                        500: function () {
                            console.log('I need to rest for a little while...');
                            gatherMore = true;
                        }
                    }, success: function (data) {
                        if (data.length > 1) {
                            gatherMore = true;
                            maxID = data[data.length - 1].StatusID;

                            $('#tblResult').show();

                            for (var ctr = 0 ; ctr < data.length - 1 ; ctr++) {
                                if ((fromDate <= (new Date(data[ctr].CreatedAt)).valueOf()) && (toDate >= (new Date(data[ctr].CreatedAt)).valueOf())) {
                                    $('#tbodyResult').append('<tr><td><img src="' + data[ctr].ProfileImageUrl + '" alt="' + data[ctr].Username + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data[ctr].CreatedAt)).toLocaleString() + ' ' + data[ctr].StatusID + ' ' + (++tweetCount) + '</span><div><span><strong>' + data[ctr].Name + '</strong></span><span class="tweet-username">' + data[ctr].Username + '</span></div><div>' + data[ctr].Tweet + '</div></td></tr>');
                                    allResults += (new Date(data[ctr].CreatedAt)) + ',' + data[ctr].Username + ',' + data[ctr].Tweet.replace(/(\r\n|\n|\r)/gm, " ") + ',https://twitter.com/' + data[ctr].Username + '/statuses/' + data[ctr].StatusID + '\n';
                                    $('#count').html('Count: ' + tweetCount);
                                    gatherMore = true;
                                }

                                if (!(fromDate <= (new Date(data[ctr].CreatedAt)).valueOf())) {
                                    gatherMore = false;
                                    clearInterval(gather);
                                    console.log("reached the end of time");
                                    $('#count').html('Count: ' + tweetCount);
                                    $('.loader').hide();
                                    $('.glyphicon-search').hide();
                                    $('.export').show();
                                    $('.search-button').removeClass('btn-info').addClass('btn-success');
                                    $('.search-button').removeClass('disabled');
                                    break;
                                }
                            }
                        }
                        //if (data.Statuses.length > 1) {
                        //    gatherMore = true;
                        //    maxID = data.Statuses[data.Statuses.length - 1].StatusID;

                        //    $('#tblResult').show();
                            
                        //    for (var ctr = 0 ; ctr < data.Statuses.length - 1 ; ctr++) {
                        //        if ((fromDate <= (new Date(data.Statuses[ctr].CreatedAt)).valueOf()) && (toDate >= (new Date(data.Statuses[ctr].CreatedAt)).valueOf())) {
                        //            $('#tbodyResult').append('<tr><td><img src="' + data.Statuses[ctr].User.ProfileImageUrl + '" alt="' + data.Statuses[ctr].User.ScreenNameResponse + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data.Statuses[ctr].CreatedAt)).toLocaleString() + ' ' + data.Statuses[ctr].StatusID + ' ' + (++tweetCount) + '</span><div><span><strong>' + data.Statuses[ctr].User.Name + '</strong></span><span class="tweet-username">' + data.Statuses[ctr].User.ScreenNameResponse + '</span></div><div>' + data.Statuses[ctr].Text + '</div></td></tr>');
                        //            allResults += (new Date(data.Statuses[ctr].CreatedAt)).toLocaleString() + ',' + data.Statuses[ctr].User.ScreenNameResponse + ',="' + data.Statuses[ctr].Text.replace(/(\r\n|\n|\r)/gm, " ") + '",https://twitter.com/' + data.Statuses[ctr].User.ScreenNameResponse + '/statuses/' + data.Statuses[ctr].StatusID + '\n';
                        //            $('#count').html('Count: ' + tweetCount);
                        //            gatherMore = true;
                        //        }

                        //        if (!(fromDate <= (new Date(data.Statuses[ctr].CreatedAt)).valueOf())) {
                        //            gatherMore = false;
                        //            clearInterval(gather);
                        //            console.log("reached the end of time");
                        //            $('#count').html('Count: ' + tweetCount);
                        //            $('.loader').hide();
                        //            $('.glyphicon-search').hide();
                        //            $('.export').show();
                        //            $('.search-button').removeClass('btn-info').addClass('btn-success');
                        //            $('.search-button').removeClass('disabled');
                        //            break;
                        //        }
                        //    }
                        //}
                        else {
                            gatherMore = false;
                            clearInterval(gather);
                            console.log("length is 1");
                            $('#count').html('Count: ' + tweetCount);
                            $('.loader').hide();
                            $('.glyphicon-search').hide();
                            $('.export').show();
                            $('.search-button').removeClass('btn-info').addClass('btn-success');
                            $('.search-button').removeClass('disabled');
                        }
                    }, fail: function (data) {
                        gatherMore = false;
                        $('#count').html('Error encountered. Please refresh the page and search again').addClass('alert-danger').removeClass('alert-success');
                    }
                }).done(function () {
                    console.log("false and done");
                });
            }
        }, 500);
    });

    $('.export').click(function () {
        var anchor = document.createElement('a');
        var csvContent = 'Date,Twitter ID,Tweet,Link\n' + allResults;
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        anchor.href = url;
        anchor.setAttribute('download', 'Tweets for ' + query + '.csv');
        anchor.click();
    });
});