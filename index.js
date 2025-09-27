import express from "express";
import fs, { mkdir } from "fs";
import { cwd } from "process";
import path from "path";
import multer from "multer";
import { v4 as uuid } from "uuid";
import child_process from "child_process";
import cors from "cors";

const app = express();
app.use(cors({
    origin: "*",
}));

app.use("/videos", express.static(path.join(cwd(), "videos")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(cwd(), "videos"))
    },
    filename: function (req, file, cb) {
        cb(null, path.parse(file.originalname).name + '-' + uuid() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

app.get("/", async (req, res) => {
    res.send("Hello world");
});

app.post("/upload", upload.single("video"), async (req, res) => {
    const videoInput = req.file.path;
    const folderId = uuid();

    child_process.exec(`ffmpeg -i ${videoInput} -filter_complex "[0:v]split=3[v1][v2][v3]; [v1]scale=-2:360[360p]; [v2]scale=-2:480[480p]; [v3]scale=-2:720[720p];" -map "[360p]" -map a:0 -c:v:0 libx264 -c:a:0 aac -map "[480p]" -map a:0 -c:v:1 libx264 -c:a:1 aac -map "[720p]" -map a:0 -c:v:2 libx264 -c:a:2 aac -hls_time 4 -hls_playlist_type vod -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" -master_pl_name "master.m3u8" -hls_segment_filename "videos/${folderId}/v%v/seg_%03d.ts" videos/${folderId}/v%v/prog.m3u8`, (err, stdout, stderr) => {
    
        if (err) {
            res.status(400).send(err);
            return;
        }

        res.send({
            m3u8: `http://localhost:3000/videos/${folderId}/master.m3u8`
        });
    })
})

app.listen(3000, () => {
    if (!fs.existsSync(path.join(cwd(), "videos"))) {
        fs.mkdirSync(path.join(cwd(), "videos"));
    }
    console.log("Port 3000");
})