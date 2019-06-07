var express = require('express')
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(process.env.PORT || 8080);
const fs = require('fs'); 

var io = socket(server);
app.use(express.static(__dirname + '/public'));

var text = {text: ''}
var flag = true

var _getAllFilesFromFolder = function(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });
    
    return results;
};

function extractText(dir){
    var plain = fs.readFileSync(dir, 'utf8')
    console.log(plain)
    io.sockets.on('connection', socket=>{
        socket.emit('textoPlano', plain)
    });

}

var result = _getAllFilesFromFolder(__dirname + "/archivos")
console.log(result);

var i, j
var arch = new String()

for(j = 0; j < result.length; j++){
    for(i = 55; i < result[j].length; i++){
        arch += result[j][i]
    }
    arch += '<br><br>'
}


    

io.sockets.on('connection', socket=>{
    console.log('a new user with id ' + socket.id + " has entered");
    socket.emit('folders',arch);
    socket.emit('pictures')

    //Editor de texto
    socket.emit('newUser', text);
    socket.on('text', data => {
        text.text = data.text
        io.sockets.emit('text', data);
        fs.writeFile('./archivos/takeMeWithU.txt', text.text, 'utf8', (err)=>{
            if(err) throw err;
            console.log('escribido')
        })
    });
});

