const http=require("http");
const fs = require("fs");

/*fs.writeFile(
    "sample.txt",
    "Hello World. Welcome to Node.js File System module.",
    (err) => {
      if (err) throw err;
      console.log("File created!");
    }
  );*/

const server=http.createServer((req,res) =>{
    const stream=fs.createReadStream("sample.txt");
    stream.pipe(res);
})

server.listen(3000)
