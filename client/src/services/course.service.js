import axios from "axios";
const API_URL = "http://127.0.0.1:8080/api/courses";

class CourseService {
  post(title, description, price) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.post(
      API_URL,
      { title, description, price },
      {
        headers: {
          Authorization: token,
        },
      },
    );
  }

  //在course-component內使用時，用if statement區分user為老師還是學生)
  // 如果user是學生，則 id => 學生id。 使用學生id，來找到學生註冊的課程 ()
  getEnrolledCourses(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/student/" + _id, {
      headers: {
        Authorization: token,
      },
    });
  }

  //在course-component內使用時，用if statement區分user為老師還是學生)
  // 如果user是老師，則 id => 老師id。 使用老師id，來找到學生註冊的課程 ()
  get(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/instructor/" + _id, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 用課程名稱搜尋課程
  getCourseByName(name) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/findByName/" + name, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 讓學生用課程id註冊課程
  // 因為是POST req，第二個參數 {} 是拿來放data用的
  // 但因為沒有data要放，所以是放一個空的 {} 就好
  enroll(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.post(
      API_URL + "/enroll/" + _id,
      {},
      {
        headers: {
          Authorization: token,
        },
      },
    );
  }
}

export default new CourseService();
