import { Request, Response } from "express";

export const developerController = {
    // the main page with user cookie test and view count
    init: (req: Request, res: Response): void => {
        if (req.session.views) {
            req.session.views++;
            res.json({ message: `View Count: ${req.session.views}` });
        } else {
            req.session.views = 1;
            res.json({ message: "First Client Visit! 🚀" });
        }
    },
};
