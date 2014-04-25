var app = app || {};

$( function() {
    // Source: USDA National Farmers Market Directory API
    // http://search.ams.usda.gov/farmersmarkets/v1/svcdesc.html
    app.getResults = function( zip ) {
        console.log( 'getResults called' );
        // or
        // function getResults(lat, lng) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            // submit a get request to the restful service zipSearch or locSearch.
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
            // or
            // url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
            dataType: 'jsonp',
            jsonpCallback: 'app.searchResultsHandler'
        });
    }
    //iterate through the JSON result object.
    app.searchResultsHandler = function( searchResults ) {
        var template = _.template( $( '#resultsTemplate' ).html() )

        $( '#results' ).append( template({
            list: searchResults.results
        }));
    }

    app.getResults( 10011 );

});