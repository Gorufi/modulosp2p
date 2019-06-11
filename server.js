var express = require('express')
var socket = require('socket.io')
var ss = require('socket.io-stream')
var app = express();
const fs = require('fs'); 
var mediaserver = require('mediaserver')
var path = require('path')

var server = app.listen(process.env.PORT || 8080);

var io = socket(server);
app.use(express.static(__dirname + '/public'));

const dirsize = 62 //En LABAM, este valor es 53

var text = {text: ''}
var txtFinal = ''
var extens = []
var results = []

var _getAllFilesFromFolder = function(dir) {

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
    socket.emit('folders', result, extens, results);
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

app.get('/public/archivos/:nombre', (req, res)=>{
    var cancion = path.join(__dirname, '/public/archivos/', req.params.nombre)
    mediaserver.pipe(req, res,cancion)
});
