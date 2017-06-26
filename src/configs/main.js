
exports.config = {
    mongo: {
        url: process.env.MONGODB_URI,
        options: {auto_reconnect: true, safe: true}
    },
    mail: {
        type: '',
        service: '',
        user: '',
        password: '',
    },
    sessionSecret: '',
    defaultLocale: '',
    demoUser: {
        type: '',
        token: '',
        pass: '',
    },
};
