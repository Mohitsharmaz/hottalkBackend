const notFound =(req,res, next)=>{
    const error = new Error(`Not Found - ${res.originalUrl}`)
    res.status(404)
    next(error)
}

const errorHandler=(err, req,res, next)=>{
    const statusCode = req.statusCode === 200 ?500 :res.statusCode
    res.status(statusCode)
    res.json({
        message: err.message, 
        stack :err.stack
    })
}

module.exports ={notFound, errorHandler}