exports.go = function (socket) {
    socket.on('newPost',function(d) {
        socket.broadcast.emit('newPost', d);
    });
};
