import WebSocket, { WebSocketServer } from "ws";
import express from 'express';
import { exec } from 'child_process' ;
import path from 'path'
import contentDisposition from 'content-disposition'
const app = express()
const port = 8082
const port_ws = 8081
const __dirname = path.resolve();


/**
 * Enables the automatic downloading feature, requires yt-dlp
 */
app.get('/down/:naslov', (req, res) => {
	const ytdlp = `yt-dlp ytsearch:"${req.params.naslov}" -x -f m4a --sponsorblock-remove all -o 'audio/%(title)s.%(ext)s' --no-playlist --no-simulate --print 'audio/%(title)s.%(ext)s' --no-progress`
	exec(ytdlp, (err, stdout, stderr) => {
		if (err) {
			res.send(err +"\n"+ req.params +"\n"+ stderr)
		} else {
			let filename = stdout.trim()
			// trim() removes /n on stdout
			res.set('Content-Disposition', contentDisposition(filename))
			res.sendFile(filename, {root: __dirname})
		}
	})

})

app.listen(port, () => {
	console.log(`express starting on${port}`)
})
let db = []
    /**
     * Set the port here
     */
const wss = new WebSocketServer({
    port: port_ws
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
