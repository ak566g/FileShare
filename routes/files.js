const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
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

router.get('/files/:uuid', async (req, res) => {
    try{
        const file = await File.findOne({uuid:req.params})
        if(!file){
            return res.render('download', {error: 'File not found'})    
        }

        return res.render('download', {
            uuid: file.uuid,
            filename: file.filename,
            fileSize: file.size,
            download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })
    }catch(err){
        return res.render('download', {error: 'Something went wrong'})
    }
})

module.exports = router