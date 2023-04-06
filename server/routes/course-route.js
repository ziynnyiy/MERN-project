const { course } = require("../models");

const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course route正在接收一個request....");
  next();
});

// 獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用講師id來尋找課程
// 將變數取名叫 _instructor_id 只是為了方便理解，以及避免搞混，取名叫什麼其實都可以
// 它其實就是為了找到mongoose 在生成 user doc 所自動生成的流水號id (primary key)
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用學生id來尋找註冊過的課程，將變數取名叫 _student_id 的理由同上
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.send(500).send(e);
  }
});

// 新增課程
router.post("/", async (req, res) => {
  // 驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send("課程創建成功。");
  } catch (e) {
    return res.status(500).send("無法創建課程");
  }
});

// 讓學生透過課程id來註冊新課程
// :要注意 find(), findOne()不能用錯個，用錯個會導致後面的push()失效
// findOne() => return a obj {}   find() => return a arr [{}]
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

// 更改課程
router.patch("/:_id", async (req, res) => {
  // 驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  // 確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程。無法更新課程內容。");
    }

    // 使用者必須是此課程講師，才能編輯課程
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      }).exec();
      return res.send({
        message: "課程已經被更新成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有此課程的講師才能編輯課程。");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  // 確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程。無法刪除課程。");
    }

    // 使用者必須是此課程講師，才能刪除課程
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已被刪除。");
    } else {
      return res.status(403).send("只有此課程的講師才能編輯課程。");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
