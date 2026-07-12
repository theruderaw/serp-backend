import { ZodError } from "zod";

export const validate = ({ body, params, query }) => {
    return (req, res, next) => {
        try {
            if (body) req.body = body.parse(req.body);
            if (params) req.params = params.parse(req.params);
            if (query) req.query = query.parse(req.query);

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    errors: err.issues,
                });
            }

            next(err);
        }
    };
};