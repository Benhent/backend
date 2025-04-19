// search.helper.js

const searchHelper = (query) => {
  let objectSearch = {
    keyword: "",
    regex: "",
  };

  if (query.keyword) {
    objectSearch.keyword = query.keyword;
    const regex = new RegExp(objectSearch.keyword, "i"); 
    objectSearch.regex = regex;
  }

  return objectSearch;
};

// Default export
export default searchHelper;
