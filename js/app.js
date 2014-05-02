var app = app || {};

$( function() {
    var $results = $( '#results' );

    app.marketTemplate = _.template( $( '#marketTemplate' ).html() );

    app.getZip = function() {
        return '10011';
    }
    app.getMarkets = function( zip ) {
        // Source: USDA National Farmers Market Directory API
        // http://search.ams.usda.gov/farmersmarkets/v1/svcdesc.html
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
            dataType: 'jsonp',
            jsonpCallback: 'app.markethResultsHandler'
        });
    };

    app.marketResultsHandler = function( searchResults ) {
        return searchResults.results;
    };

    app.renderMarkets = function( results ) {
        $results.append( app.marketTemplate({
            list: results
        }));
    };

    app.init = function() {
        var zip = app.getZip(),
            markets = app.getMarkets( zip );

        app.renderMarkets( markets );
    };





    app.init();

});