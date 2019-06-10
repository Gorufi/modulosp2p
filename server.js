var express = require('express')
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var app = express();
const fs = require('fs'); 

var server = app.listen(process.env.PORT || 8080);

var io = socket(server);
app.use(express.static(__dirname + '/public'));

const dirsize = 60 //En LABAM, este valor es 53

var text = {text: ''}
var txtFinal = ''
var extens = []

var _getAllFilesFromFolder = function(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });
    
    var i, j
    var arch = new String()

    for(j = 0; j < results.length; j++){
        for(i = dirsize; i < results[j].length; i++){
            arch += results[j][i]
        }
        arch += '<br><br>'
    }

    extens = getTypes(arch)
    console.log(extens)
    asignartxt(results, extens)
    return arch;
};

function getTypes(archives){
    var exten = []
    for(var i = 0; i < archives.length; i++){
        if (archives[i] == '.' ){
            exten[i] = archives[i+1] + archives[i+2] + archives[i+3] 
            i +=8
        }  
    };
    exten = exten.filter(function(el){
        return el != null
    });
    return exten
}

function asignartxt(array, exten){
    var newA = []
    newA = array
    for(var i = 0; i < exten.length; i++){
        if(exten[i] == 'txt'){
            txtFinal = newA[i]
        }

    };
}

var result = _getAllFilesFromFolder(__dirname + "/public/archivos")
console.log(result);

io.sockets.on('connection', socket=>{
    console.log('a new user with id ' + socket.id + " has entered");
    socket.emit('folders', result, extens);
    //socket.emit('pictures', extens)

    //Editor de texto
    socket.emit('newUser', text);
    socket.on('text', data => {
        text.text = data.text
        io.sockets.emit('text', data);
        fs.writeFile(txtFinal, text.text, 'utf8', (err)=>{
            if(err) throw err;
            console.log('Archivo modificado por:'+ socket.id)
        })
    });
});

http.on('request', function(request, response){
    var inputStream = fs.open('./public/archivos/Funciona.mp3')
    inputStream.pipe(response)
});

