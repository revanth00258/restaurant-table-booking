require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
// const bodyParser = require("body-parser");
const compression = require("compression");

const log4js = require("log4js");
const config = require("config");
const path = require("path");
//const swaggerJsDoc = require("swagger-jsdoc");
//const swaggerUI = require("swagger-ui-express");
const nodeSSPI = require("node-sspi");
//const schedule = require("./utils/settings");
// let cacheProvider = require('./utils/cache.util');
//const zip = require("./utils/zipLog");

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
// app.use(bodyParser.json());
//schedule.scheduler();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(helmet());
//zip.instance();
// app.use(cookieParser());

/* Logger Configuration */
let date = new Date();
let today = date.toDateString();
log4js.configure({
  appenders: {
    fileAppender: {
      type: "file",
      filename: `./logs/${today}.log`,
      maxLogSize: 10485760,
      keepFileExt: true,
      compress: false,
      keepFileExt: true,
      backups: 3,
    },
  },
  categories: {
    default: {
      appenders: ["fileAppender"],
      level: "all", // info
    },
  },
});

const logger = log4js.getLogger();
logger.level = "all";

/* CORS Configuration */
var corsOptions = {
  origin: [
    "http://localhost:4001",
    "http://localhost:5008",
    "http://localhost:4200",
    "http://inm01135:4001/",
    "http://rcinapp10:5001/",
    "http://localhost:3000",
  ],
  methods: [
    "GET",
    "POST",
    "DELETE",
    "UPDATE",
    "PUT",
    "PATCH",
    "OPTIONS"
    ],
  credentials: true,
  // headers: ['x-foo']                 // sets expose-headers
  // maxAge: 3600*90000,
  // optionsSuccessStatus: 204,
  // preflightContinue: false,
  // exposedHeaders: ['Content-Range', 'X-Content-Range'],
  // allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  next();
});
app.disable("etag");

/* Database Configuration */
const db = require("./config/db");
const { hostname } = require("os");
const dbName = config.get("dbName");

db.authenticate()
  .then(() => {
    logger.info(`Connected to Database: ${dbName}`);
    console.log(`Connected to Database: ${dbName}`);
  })
  .catch((err) => {
    logger.error(
      `Failed to connect to Database: ${dbName} - ${err} - ${new Error().stack}`
    );
    console.log(`Failed to connect to Database: ${dbName}`);
  });

//require("./models/modelInit");

/* Node-SSPI - Windows Authentication*/
// app.use((req, res, next) => {
//   const nodeSSPIObj = new nodeSSPI({
//     retrieveGroups: true,
//   });
//   nodeSSPIObj.authenticate(req, res, (err) => {
//     res.finished || next();
//   });
// });

/* Route Configuration */
// app.use("/", express.static(path.join("")));
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/site", require("./routes/site"));
app.use("/api/employee", require("./routes/employee"));
// app.use("/api/sbu", require("./routes/sbu"));
// app.use("/api/auditType", require("./routes/sbu"));
// app.use("/api/master", require("./routes/master"));
// app.use("/api/question", require("./routes/questionr"));
// app.use("/api/checklist", require("./routes/checklist"));
// app.use("/api/cell", require("./routes/cell"));
// app.use("/api/audit", require("./routes/audit"));

/* Error Handling */
app.use((err, req, res, next) => {
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

// cacheProvider.start((err) => {
//     if (err) console.error(err)
// })
/* Email Template Configuration */
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

/* Build Configuration */
app.use(express.static(path.join(__dirname, 'dist/lpa')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/lpa/index.html'));
})

/* Server Configuration */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server listening at PORT: ${PORT}`);
})
process.on('exit', function (code) {
    return console.log(`Process to exit with code ${code}`);
});
