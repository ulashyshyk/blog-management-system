// Name: Ulash Yshyk
// Student Number: 153349220
// Email: uyshyk@myseneca.ca
// Create Date: 2025/02/04
// Last Modified Date: 2025/02/05

const fs = require("fs").promises
const path = require("path")

global.articles = [];
global.categories = [];

async function initialize(){
    return new Promise(async (resolve,reject) => {
        try {

            const articlesPath = path.join(process.cwd(), "data", "articles.json");
            const categoriesPath = path.join(process.cwd(), "data", "categories.json");

            const articlesData = await fs.readFile(articlesPath,'utf8')
            global.articles = JSON.parse(articlesData)

            const categoriesData = await fs.readFile(categoriesPath,'utf8')
            global.categories = JSON.parse(categoriesData)

            resolve()
        } catch (error) {
            reject("Unable to read file.");
        }
    })
}

function getPublishedArticles(){
    return new Promise((resolve,reject) => {
        const publishedArticles = global.articles.filter(article => article.published === true) 

        if(publishedArticles.length === 0){
            return reject("No results returned")
        }

        resolve(publishedArticles);
    })
}

function getCategories(){
    return new Promise((resolve,reject) => {
        if(global.categories.length === 0){
            return reject("No results returned")
        }        

        resolve(global.categories)
    })
}

module.exports = { initialize, getPublishedArticles, getCategories };
