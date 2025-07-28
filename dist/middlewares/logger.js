"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logger = (req, res, next) => {
    console.log('---');
    console.log('Method:', req.method);
    console.log('Path:  ', req.path);
    console.log('Body:  ', req.body);
    console.log('---');
    next();
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map