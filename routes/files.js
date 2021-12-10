const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const File = require('../models/file')
const sendMail = require('../services/emailService')
const emailTemplate = require('../services/emailTemplate')

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

// file upload endpoint
router.post('/files', (req, res) => {
    // store file in uploads
    upload(req, res, async (err) => {
        // validate request
        if(err){
            return res.status(500).send({
                error: err.message
            })
        }
        // console.log(req.file)
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
            file:  `${process.env.APP_BASE_URL}/api/files/download/${response.uuid}`
        })
    })
})


// download details endpoint
router.get('/files/:uuid', async (req, res) => {
    try{
        const file = await File.findOne({uuid:req.params.uuid})
        
        if(!file){
            return res.render('download', {error: 'File not found'})    
        }
        
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })

    }catch(err){
        return res.render('download', {error: 'Something went wrong'})
    }
})

// download link
router.get('/files/download/:uuid', async (req, res)=> {
    const file = await File.findOne({uuid: req.params.uuid})
    if(!file){
        return res.render('download', {error: 'Link has been expired'})
    }
    const filePath = `${__dirname}/../${file.path}`
    res.download(filePath)
})

// email send endpoint
router.post('/files/send', async (req, res) => {
    const {uuid, emailTo, emailFrom } = req.body

    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({
            error: "All fields are required"
        })
    }

    // Get data from db
    const file = await File.findOne({
        uuid: uuid
    })

    if(file.sender){
        return res.status(422).send({
            error: "Email already sent"
        })
    }

    file.sender = emailFrom
    file.receiver = emailTo

    const response = await file.save()

    // send email
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'FileShare',
        text: `${emailFrom} shared a file with you`,
        html: emailTemplate({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/api/files/download/${uuid}`,
            size: parseInt(file.size/1000) + 'KB',
            expires: '24 hours'
        })
    })
    
    return res.send({
        success: true
    })
})

module.exports = router