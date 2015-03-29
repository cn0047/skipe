exports.config = {
    mongoLocal: {
        host: 'localhost',
        port: 27017,
        options: {auto_reconnect: true, safe: true},
        base: 'skipe',
    },
    mongo: {
        url: 'mongodb://skipeUserAdditional:asdfOYUYKHK57fasdf@ds027771.mongolab.com:27771/skipe',
        options: {auto_reconnect: true, safe: true},
    },
    mail: {
        type: 'SMTP',
        service: 'Gmail',
        user: 'codenamek2010@gmail.com',
        password: 'codenamek2010-007',
    },
    sessionSecret: 'asdflkw458u349u53$%()I)kjeldsjfsldk!#$$00ii-skldfjs.d25',
    defaultLocale: 'en',
    demoUser: {
        _id: '54b23de857fe2afb0c1182bf',
        sname: 'James Bond',
    },
};
