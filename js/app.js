var app = app || {};

$( function() {
    var $results = $( '#results' );
    app.collections = {};
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

    app.collections.markets = {
        items: [],
        render: function() {
            _.each( this.items, function( item ) {
                $results.append( item.render() );
            });
        }
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

    app.addMarketDetails = function( data ) {
        var detailedResults = $.extend( {}, data.results );
        _.each( detailedResults, function( result ) {
            console.log( '_.each called for ' + result.marketname );
            var details = app.getMarketDetails( result.id );
            details.then( function( data ) {
                result.marketdetails = $.extend( {}, data.marketdetails );
                // collection.push( new app.models.Market( result ) );
            });
        });
        console.log( 'detailedResutls: ' + detailedResults );
        return $.when.apply( $, detailedResults );
    };

    app.init = function() {
        var zip = app.getZip();

        app.getMarkets( zip )
        .then( app.addMarketDetails )
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