const errorMiddleware = (err, req, res, next) => {
    console.error(err); 

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'server internal error',
        ...(err.details && { details: err.details }) 
    });
};

module.exports = errorMiddleware;
