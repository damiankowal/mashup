var app = app || {};

$( function() {
    var $results = $( '#results' );
    app.collections = {};
    app.models = {};
    app.views = {};

    app.marketTemplate = _.template( $( '#marketTemplate' ).html() );

    app.models.Market = function( data ) {
        // format: {"id":"1002192", "marketname":"1.7 Ballston FRESHFARM Market"}
        this.id = data.id;
        this.distance = data.marketname.substr( 0, data.marketname.indexOf( ' ' ) );
        this.name = data.marketname.substr( data.marketname.indexOf( ' ' ) + 1 );
    };

    app.models.Market.prototype.render = function() {
        return app.marketTemplate({
            market: this
        });
    };

    app.collections.Markets = function( markets ) {
        this.items = markets;
    };

    app.collections.Markets.prototype.render = function() {
        _.each( this.items, function( item ) {
            $results.append( item.render() );
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

    app.buildMarketCollection = function( data ) {
        var collection = [];
        _.each( data.results, function( result ) {
            collection.push( new app.models.Market( result ) );
        });
        return collection;
    };

    app.init = function() {
        var zip = app.getZip();

        app.getMarkets( zip )
        .then( app.buildMarketCollection )
        .then( function( marketList ) {
            app.collections.markets = new app.collections.Markets( marketList );
        })
        .then( function() {
            app.collections.markets.render();
        });
    };

    app.init();

});