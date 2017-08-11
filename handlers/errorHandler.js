module.exports = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    console.log(err.ex)

    if (!err.status) err.status = 500
    if (!err.msg) err.msg = "Internal server error"

    res.status(err.status)
    res.json({
        status: err.status,
        content: err.msg
    })
}