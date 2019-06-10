var http = require('http')
var fs = require('fs')

http.on('request', function(request, response){
    var inputStream = fs.open('./public/archivos/Funciona.mp3')
    inputStream.pipe(response)
});