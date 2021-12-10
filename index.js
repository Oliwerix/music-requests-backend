import WebSocket, { WebSocketServer } from "ws";

let db = []
    /**
     * Set the port here
     */
const wss = new WebSocketServer({
    port: 8080
});
console.log("started")

/**
 * When a client connects, send him the whole db, then, on each update, send each client the new, updated, db
 */
wss.on('connection', (ws) => {
        ws.send(JSON.stringify(db))
        ws.on('message', (data) => {
            dbInsert(JSON.parse(data))
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN)
                    client.send(JSON.stringify(db))
            })
        });
    })
    /**
     * Modifies the db according to input
     * Expected input
     * {
     *  naslov: string,
     *  votes:  number,
     *  remove: bool
     * }
     * @param {Array} obj 
     */
function dbInsert(obj) {
    // if remove is set to something (not important)
    if (obj.remove === true)
        db = db.filter(item => item.naslov !== obj.naslov)
    else {
        // find the modified element
        let cur = db.find(x => x.naslov === obj.naslov)
        if (cur) {
            // if found we remove saind element
            console.log("found", cur)
            let index = db.indexOf(cur);
            db.fill(cur.votes = obj.votes, index, index++)
        } else {
            // if not found we simply add the element to the db
            db = [obj, ...db]
        }
    }
}