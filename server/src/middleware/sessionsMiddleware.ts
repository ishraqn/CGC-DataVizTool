import session from "express-session";

// express-session cookie configuration for user session management
export const sessionMiddleware = session({
	secret: process.env.SECRET_KEY || "default_secret",
	resave: false,
	saveUninitialized: true,
	//ternary operator to check if the environment is production or development
	cookie: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "strict",
		maxAge: parseInt(process.env.SESSION_MAX_AGE || "3600000"), // 1 hour if not specified
	},
});
