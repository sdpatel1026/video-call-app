const redisClient = require("./config/redis");

exports.saveCallId = (key, value) => {

    return new Promise((resolve, reject) => {
        redisClient.SET(key, JSON.stringify(value), "EX", 86400, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

exports.getCallId = async (key) => {
    console.log("getcall-id")
    const response = await redisClient.get(key)
    return JSON.parse(response)
};