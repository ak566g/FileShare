const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const file = require('../models/file')

const File = require('../models/file')

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

let upload = multer({
    storage,
    limits:{
        fieldSize: 1000000*100
    }
}).single('myfile')

router.post('/files', (req, res) => {
    // store file in uploads
    upload(req, res, async (err) => {
        // validate request
        if(err){
            return res.status(500).send({
                error: err.message
            })
        }
        console.log(req.file)
        if(!req.file){
            return res.json({
                error: "All fields are required"
            })
        }

        // store meta data into database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path, 
            size: req.file.size
        })
        
        // response --> download link
        const response = await file.save()
        return res.json({
            file:  `${process.env.APP_BASE_URL}/files/${response.uuid}`
        })
    })
})

module.exports = router