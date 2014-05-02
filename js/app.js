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
        return $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
            dataType: 'jsonp',
        });
    };

    app.renderMarkets = function( data ) {
        $results.append( app.marketTemplate({
            list: data.results
        }));
    };

    app.init = function() {
        var zip = app.getZip(),
            marketsPromise = app.getMarkets( zip );

        marketsPromise.then( app.renderMarkets );
    };

    app.init();

});