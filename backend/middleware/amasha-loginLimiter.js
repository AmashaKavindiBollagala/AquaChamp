import rateLimit from 'express-rate-limit';
import { logEvents } from './amasha-logger.js';

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // max 5 login attempts per minute per IP
    message: { message: 'Too many login attempts from this IP, please try again after a 60 second pause' },
    handler: (req, res, next, options) => {
        logEvents(
            `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
            'errLog.log'
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default loginLimiter;