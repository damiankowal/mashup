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

    app.getMarketDetails = function( data ) {
        console.log( 'getMarketDetails called for ' + data.marketname );
        return $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + data.id,
            dataType: 'jsonp',
        });
    };

    app.addMarketDetails = function( data ) {
        var detailsPromises = [];
        var results = data.results;
        for ( var i = 0, l = results.length; i < l; i += 1 ) {
            detailsPromises.push(
                app.getMarketDetails( results[ i ] )
                .then( function( data ) {
                    results[ i ].marketdetails = $.extend( {}, data.marketdetails );
                })
            );
        }
        /*
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
        $.when.apply( $, detailsPromises );
    };

    app.instantiateMarketModels = function ( data ) {
        var items = [];
        console.log( data );
        _.each( data, function( market ) {
            console.log( 'a' );
            items.push( new app.models.Market( market ) );
        });
        console.log( items );
        return items;
    }

    app.init = function() {
        var zip = app.getZip();

        app.getMarkets( zip )
        .then( app.addMarketDetails )
        .then( app.instantiateMarketModels )
        // .then( function( marketList ) {
            // app.collections.markets = new app.collections.Markets( marketList );
        // })
        .then( function() {
            console.log( 'calling render' );
            // app.collections.markets.render();
        });
    };

    app.init();

});