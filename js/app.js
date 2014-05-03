var app = app || {};

$( function() {
    var $results = $( '#results' );

    app.models = {};

    app.markets = {
        items: [],
        render: function() {
            _.each( this.items, function( item ) {
                $results.append( item.render() );
            });
        }
    };

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
            result,
            results = data.results;

        function extendResult( result, data ) {
            return function ( data ) {
                var details = $.extend( {}, data.marketdetails );
                result.marketdetails = details;
                app.markets.items.push( new app.models.Market( result ) );
            }
        }

        for ( var i = 0, l = results.length; i < l; i += 1 ) {
            result = $.extend( {}, results[ i ] );
            detailsPromises[ i ] = app.getMarketDetails( result.id )
            .then( extendResult( result, data ) );
        }
        
        return $.when.apply( $, detailsPromises )
    };

    app.init = function() {
        var dataPromise,
            zip = app.getZip();

        dataPromise = app.getMarkets( zip )
        .then( app.collectMarketDetails );
        
        $.when( dataPromise ).done( function() {
            console.log ( 'when called');
            app.markets.render();
        });
    };

    app.init();

});