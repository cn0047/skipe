/**
 * @todo Delete it from here.
 */
window.socket = io.connect('http://localhost:3000');

socket.on('newPost', function (d) {
    app.views.account_home.incomingPost(d);
});
