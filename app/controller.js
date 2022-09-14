const { saveCallId, getCallId } = require("./model");

exports.saveCallId = async (req, res) => {
    try {
        console.log("controller-saveCallId")
        const { id, signalData } = req.body;
        await saveCallId(id, signalData);
        res.status(200).send(true);
    } catch (ex) {
        console.log("exception in saving id:", ex)
        res.status(400).send(ex.message);
    }
};

exports.getCallId = async (req, res) => {
    try {
        console.log("controller-getCallId")
        const { id } = req.params;
        const code = await getCallId(id);
        console.log("code:- ", code)
        res.status(200).send({ code });
    } catch (ex) {
        res.status(400).send(ex.message);
    }
};