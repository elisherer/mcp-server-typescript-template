import express from "express";
import { createLogger, loggerMiddleware } from "./src/logger";
import initMcpServer from "./src/init";

const logger = createLogger("server");

process.on("uncaughtException", function (err) {
    logger.info("Some unhandled error occurred");
    logger.error(err);
    logger.info("Stopping server");
    process.exit(1);
});

const portFromArgs = process.argv.find((arg: string) => arg.startsWith("--port="));
const PORT = parseInt(portFromArgs?.substring(7) || process.env.SERVER_PORT || "3001", 10);

const main = async () => {
    const app = express();

    const bodyParser = express.json();
    app.use(function (req, res, next) {
        if ((req.headers["content-type"]?.indexOf("multipart") ?? -1) > -1) {
            return next();
        }
        return bodyParser(req, res, next);
    });
    app.use(express.urlencoded({ extended: true }));

    loggerMiddleware(app);
    initMcpServer(app);

    app.listen(PORT, () => {
        logger.info(`Server is running (http://localhost:${PORT})`);
    });
};

main().catch(e => logger.error(e));
