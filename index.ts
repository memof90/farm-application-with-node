const fs = require("fs/promises");
const http = require("http");

// TODO: sync

// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');

// const textOut = `This is what know about the avocado: ${textInput}. \n created on ${Date.now()}`;

// fs.writeFileSync('./txt/output.txt', textOut);

// console.log(textInput);

// TODO: Async

//  const readFiles = async () => {
//     try {
//         const data1 = await fs.readFile('./txt/start.txt', {encoding: 'utf-8'});
//         console.log(data1);
//     } catch (err) {
//         console.log(err)
//     }
// }

// readFiles();

// fs.readFile('./txt/start.txt','utf-8', (data, error) => {
//     if (error) {
//         console.error(error);
//         return;
//       }
//     console.log(data);
//   });

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  return output;
};

async function readFilesJson(resp) {
  try {
    const data = await fs.readFile(`${__dirname}/dev-data/data.json`, {
      encoding: "utf-8",
    });
    const productData = JSON.parse(data);
    console.log(productData);
    resp.writeHead(200, {
      "Content-type": "application/json",
    });
    resp.end(data);
  } catch (err) {
    console.log(err);
  }
}

async function readOverviewTemplate(resp) {
  try {
    const tempOverview = await fs.readFile(
      `${__dirname}/templates/template-overview.html`,
      {
        encoding: "utf-8",
      }
    );
    const dataCardsObj = await fs.readFile(`${__dirname}/dev-data/data.json`, {
      encoding: "utf-8",
    });
    const tempCard = await fs.readFile(
      `${__dirname}/templates/template-card.html`,
      {
        encoding: "utf-8",
      }
    );
    const productData = JSON.parse(dataCardsObj);
    const cardHtml = productData
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCTS_CARDS%}", cardHtml);
    resp.writeHead(200, {
      "Content-type": "text/html",
    });

    resp.end(output);
  } catch (err) {
    console.log(err);
  }
}

// TODO: Server

const server = http.createServer((req, resp) => {
  const pathName = req.url;

  switch (pathName) {
    case "/":
    case "/overview":
      readOverviewTemplate(resp);
      break;
    case "/product":
      resp.end("product");
      break;
    case "/api":
      readFilesJson(resp);
      break;
    default:
      resp.writeHead(404, {
        "Content-type": "text/html",
      });
      resp.end("<h1>Page not found</h1>");
      break;
  }
  console.log(pathName);
});
server.listen(8000, "192.168.100.6", () => {
  console.log("Listening to request on port 8000");
});
