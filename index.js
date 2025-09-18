const fs = require("fs/promises");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplate");
const parseJson = require("./modules/parseJson");

// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');

// console.log(textInput);

// fs.readFile('./txt/start.txt','utf-8', (data, err) => {
//     if (err) {
//         console.error(err);
//         return;
//       }
//     console.log(data);
// });

// async function readFiles() {
//     try {
//         const data = await fs.readFile('./txt/start.txt', {encoding: 'utf-8'});
//         console.log(data);
//     } catch (err) {
//         console.log(err)
//     }
// }

// readFiles();

// const replaceTemplate = (temp, product) => {
//   let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
//   output = output.replace(/{%IMAGE%}/g, product.image);
//   output = output.replace(/{%PRICE%}/g, product.price);
//   output = output.replace(/{%FROM%}/g, product.from);
//   output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
//   output = output.replace(/{%QUANTITY%}/g, product.quantity);
//   output = output.replace(/{%DESCRIPTION%}/g, product.description);
//   output = output.replace(/{%ID%}/g, product.id);

//   if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
//   return output;
// }

const readDataFiles = (route) => {
  const data = fs.readFile(`${__dirname}${route}`, {
    encoding: "utf-8",
  });

  return data;
};

// TODO: Server

async function readFilesJson(resp) {
  try {
    const data = await readDataFiles("/dev-data/data.json");
    const productData = await parseJson(data);
    console.log(typeof productData);
    console.log(productData);
    resp.writeHead(200, {
      "Content-Type": "application/json",
    });
    resp.end(data);
  } catch (err) {
    console.log(err);
  }
}

async function readOverviewTemplate(resp) {
  try {
    const tempOverview = await readDataFiles(
      "/templates/template-overview.html"
    );
    const dataCardsObj = await readDataFiles("/dev-data/data.json");
    const tempCard = await readDataFiles("/templates/template-card.html");
    const productData = JSON.parse(dataCardsObj);
    const cardHtml = productData
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCTS_CARDS%}", cardHtml);
    resp.writeHead(200, {
      "Content-Type": "text/html",
    });

    resp.end(output);
  } catch (err) {
    console.log(err);
  }
}

async function readProductTemplate(resp, query) {
  try {
    const tempProduct = await readDataFiles("/templates/template-product.html");
    const dataJson = await readDataFiles("/dev-data/data.json");
    const dataObj = JSON.parse(dataJson);
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    resp.writeHead(200, {
      "Content-Type": "text/html",
    });
    resp.end(output);
  } catch (err) {
    console.log(err);
  }
}

const server = http.createServer((req, resp) => {
  const { query, pathname } = url.parse(req.url, true);

  // OLD PathName
  // const pathName = req.url;

  switch (pathname) {
    case "/":
    case "/overview":
      readOverviewTemplate(resp);
      break;
    case "/product":
      console.log(query);
      readProductTemplate(resp, query);
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
  console.log(pathname);
});

server.listen(8000, "192.168.1.8", () => {
  console.log("Listening to request on port 8000");
});
