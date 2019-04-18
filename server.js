const http = require('http');
const io = require('socket.io').listen(3001);

var allClients = [];
io.on('connection', function (socket) {
    console.log('connected:', socket.client.id);
    allClients.push(socket);
    socket.on('disconnect', function() {
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
     });
});

const port = process.env.PORT || 80;
const server = http.createServer((request, response) => {
    if (request.method == 'POST' && request.headers['x-slack-signature'] != undefined) {
        var body = ''
        request.on('data', function (data) {
            body += data
            // console.log('Partial body: ' + body)
        })
        request.on('end', function () {
            body = body.replace('payload=', '');
            console.log('Body: ' + body)

            let decoded = decodeURIComponent(body);
            let payload = JSON.parse(decoded);

            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(`Proxy received request.`);
            
            io.emit(payload.callback_id, body);
        })
    }
    else {
        console.log('GET')
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not found");
        response.end();
    }
});
server.listen(port, () => {
    console.log(`Server running at port ` + port);
});