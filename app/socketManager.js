const io = require("./../server").io;

module.exports = (socket) => {
    try {
        console.log("Connected-socketManager");
        socket.on("code", (data, callback) => {
            console.log("sockerManager-socket.on(code)")
            socket.broadcast.emit("code", data);
        });
    } catch (ex) {
        console.log(ex.message);
    }
};



