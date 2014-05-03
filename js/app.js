var app = app || {};

$( function() {
    var $results = $( '#results' );
    app.markets = {
        items: [],
        render: function() {
            _.each( this.items, function( item ) {
                $results.append( item.render() );
            });
        }
    };
    app.models = {};
    app.views = {};

    app.marketTemplate = _.template( $( '#marketTemplate' ).html() );

    app.models.Market = function( data ) {
        this.id = data.id;
        this.distance = data.marketname.substr( 0, data.marketname.indexOf( ' ' ) );
        this.name = data.marketname.substr( data.marketname.indexOf( ' ' ) + 1 );
        this.googleLink = data.marketdetails.GoogleLink;
        this.address = data.marketdetails.Address;
        this.schedule = data.marketdetails.Schedule;
        this.products = data.marketdetails.Products;
        console.log( 'instantiaing ' + this.name );
    };

    app.models.Market.prototype.render = function() {
        return app.marketTemplate({
            market: this
        });
    };

    app.getZip = function() {
        return '10011';
    };

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

    app.getMarketDetails = function( id ) {
        return $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
            dataType: 'jsonp',
        });
    };

    app.collectMarketDetails = function( data ) {
        var detailsPromises = [],
            results = data.results;

        for ( var i = 0, l = results.length; i < l; i += 1 ) {
            detailsPromises[ i ] = app.getMarketDetails( results[ i ].id )
            .then( function( data ) {
                console.log( data );
            });
        }

        
        return $.when.apply( $, detailsPromises )//.done( function() {
           //console.log( detailsPromises );
        //});
    
        /*
                .then( function( data ) {
                    results[ i ].marketdetails = $.extend( {}, data.marketdetails );
                })
            );
        }
        _.each( data.results, function( result ) {
            console.log( '_.each called for ' + result.marketname );
            app.getMarketDetails( result )
            .then( function( data ) {
                console.log( 'details.then called, ' + result.marketname );
                result.marketdetails = $.extend( {}, data.marketdetails );
                //detailedResults.push( new app.models.Market( result ) );
            });
        });
        */
 
    };



    app.init = function() {
        var dataPromise;
        var zip = app.getZip();

        dataPromise = app.getMarkets( zip )
        .then( app.collectMarketDetails );
        //.then( app.addMarketDetails )
        //.then( app.instantiateMarketModels )
        // .then( function( marketList ) {
            // app.collections.markets = new app.collections.Markets( marketList );
        // })
        $.when( dataPromise ).done( function( data ) {
            console.log ( 'when called' + data )
            _.each( data, function( item ) {
                console.log( item.responseJSON );
            })
            console.log( 'calling render ' );
            // app.collections.markets.render();
        });
    };

    app.init();

});