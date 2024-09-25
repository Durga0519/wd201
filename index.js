const http = require("http");
const fs = require("fs");
const minimist = require("minimist");

// Load the content of HTML files
let homeContent = "";
let projectContent = "";
let registrationContent = "";

// Read the HTML files asynchronously
fs.readFile("home.html", (err, home) => {
  if (err) throw err;
  homeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) throw err;
  projectContent = project;
});

fs.readFile("registration.html", (err, registration) => {
  if (err) throw err;
  registrationContent = registration;
});

const args = minimist(process.argv.slice(2));
const port = args.port || 3000; 

http.createServer((request, response) => {
  let url = request.url;
  response.writeHead(200, { "Content-Type": "text/html" });

  switch (url) {
    case "/project":
      response.write(projectContent);
      response.end();
      break;
    case "/registration":
      response.write(registrationContent);
      response.end();
      break;
    default:
      response.write(homeContent);
      response.end();
      break;
  }
}).listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
