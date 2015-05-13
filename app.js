var Hapi = require('hapi');
/*var qBank = require('qBank');*/

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: false,
            index:true
        }
    }
});
// Add the route
server.route({
    method: 'GET',
    path:'/api/{tag}/{page}',
    handler: function (request, reply) {
        var tag = request.params.tag ;
        var page= request.params.page ;
        var p = qBank.getQuestionsByTag(tag,page,
            function(result){
                reply(result).type('text/plain');
            }
        ) ;

        return p;
    }
});
/*server.route({
    method: 'GET',
    path:'/api',
    handler: function (request, reply) {
        var p = new Promise( function(resolve, reject){
            setTimeout(function(){
                resolve("Hello from resolve");
            } , 2000);
        });

        reply(p);
    }
});*/

// Start the server
server.start();