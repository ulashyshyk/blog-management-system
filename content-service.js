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
            //paths to JSON files
            const articlesPath = path.join(process.cwd(), "data", "articles.json");
            const categoriesPath = path.join(process.cwd(), "data", "categories.json");    

            //reading articles.json
            const articlesData = await fs.readFile(articlesPath,'utf8')
            global.articles = JSON.parse(articlesData)

            //reading categories.json
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
        const publishedArticles = global.articles.filter(article => article.published === true) //gets published articles

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

async function saveArticles() {
    try {
        const articlesPath = path.join(process.cwd(), "data", "articles.json");
        await fs.writeFile(articlesPath, JSON.stringify(global.articles, null, 2), 'utf8'); //writes articles array as JSON back to the file with nice format
    } catch (err) {
        throw new Error("Failed to save articles")
    }
}
module.exports = { initialize, getPublishedArticles, getCategories };

module.exports.addArticle = (articleData) => {
    return new Promise(async(resolve, reject) => {
        articleData.published = true; 
        articleData.id = global.articles.length + 1; // Set ID to the current length + 1
        articleData.publishedDate = new Date().toISOString().split('T')[0];  // Sets current date in YYYY-MM-DD format
        global.articles.push(articleData);

        await saveArticles();      //saves article 

        resolve(articleData);
    });
    }

module.exports.getArticlesByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const filteredArticles = articles.filter(article => article.category == category);
        if (filteredArticles.length > 0) resolve(filteredArticles);
        else reject("no results returned");
    });
};

module.exports.getArticlesByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredArticles = articles.filter(article => new Date(article.publishedDate) >= minDate);
        if (filteredArticles.length > 0) resolve(filteredArticles);
        else reject("no results returned");
    });
};

module.exports.getArticleById = (id) => {
    return new Promise((resolve, reject) => {
    const foundArticle = articles.find(article => article.id == id);
    if (foundArticle) resolve(foundArticle);
    else reject("no result returned");
    });
};