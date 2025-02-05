const fs = require("fs").promises

global.articles = [];
global.categories = [];

async function initialize(){
    return new Promise(async (resolve,reject) => {
        try {

            const articlesData = await fs.readFile('./data/articles.json','utf8')
            global.articles = JSON.parse(articlesData)

            const categoriesData = await fs.readFile('./data/categories.json','utf8')
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
