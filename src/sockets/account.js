exports.go = function (socket) {
    socket.on('addMe',function(name) {
        socket.emit('added', {m: name+' You have connected'});
    });
};
