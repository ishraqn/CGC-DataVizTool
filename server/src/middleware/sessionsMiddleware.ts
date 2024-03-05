import session from "express-session";

// express-session cookie configuration for user session management
export const sessionMiddleware = session({
	secret: process.env.SECRET_KEY || "secret",
	resave: false,
	saveUninitialized: true,
	//ternary operator to check if the environment is production or development
	cookie: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "strict",
		maxAge: 1000 * 60 * 60, // 1 hour
	},
});
