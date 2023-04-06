// 如果有任何文件require這個models資料夾，就可以得到有user及course屬性的物件
// 而且user及course屬性各代表著之前製作的兩個不同的model

module.exports = {
  user: require("./user-model"),
  course: require("./course-model"),
};
