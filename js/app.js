var app = app || {};

$( function() {
    app.$el = $( '#results' );

    app.markets = {
        items: []
    };

    app.models = {};

    app.templates = {
        header: _.template( $( '#headerTemplate' ).html() ),
        market: _.template( $( '#marketTemplate' ).html() )
    };

    app.models.Market = function( data ) {
        this.id = data.id;
        this.distance = data.marketname.substr( 0, data.marketname.indexOf( ' ' ) );
        this.name = data.marketname.substr( data.marketname.indexOf( ' ' ) + 1 );
        this.googleLink = data.marketdetails.GoogleLink;
        this.address = data.marketdetails.Address;
        this.schedule = data.marketdetails.Schedule;
        this.products = data.marketdetails.Products;
    };

    app.models.Market.prototype.render = function() {
        return app.templates.market({
            market: this
        });
    };

    app.markets.render = function() {
        _.each( this.items, function( item ) {
            app.$el.append( item.render() );
        });
    };

    app.renderHeader = function( zip ) {
        app.$el.append( app.templates.header({
            zip: zip
        }));
    };

    app.getZip = function() {
        return '10018';
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
            // Return a function which will add market details to a
            // result object, capturing the result object in a closure
            // so it is avaiable when the function is called by .then
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
        
        return $.when.apply( $, detailsPromises );
    };

    app.init = function() {
        var dataPromise,
            zip = app.getZip();

        app.renderHeader( zip );

        dataPromise = app.getMarkets( zip )
            .then( app.collectMarketDetails );
        
        $.when( dataPromise ).done( function() {
            app.markets.render();
        });
    };

    app.init();

});