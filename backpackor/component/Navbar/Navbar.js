// components/navbar/Navbar.js

import styles from "./Navbar.module.css"; // 'styles'가 아래에서 사용되므로 색상이 진해짐

function Navbar() {
  return (
    // className을 {styles.클래스명} 형태로 바꿔서 'styles'를 사용!
    <nav className={styles.navbar}>
      <div className={styles["navbar-logo"]}>
        <a href="#">BackpacKOR</a>
      </div>

      <ul className={styles["navbar-menu"]}>
        <li>
          <a href="#">홈</a>
        </li>
        <li>
          <a href="#">여행지</a>
        </li>
        <li>
          <a href="#">일정 만들기</a>
        </li>
        <li>
          <a href="#">내 일정</a>
        </li>
        <li>
          <a href="#">리뷰</a>
        </li>
      </ul>

      <div className={styles["navbar-user"]}>
        <a href="/login">로그인</a>
      </div>
    </nav>
  );
}

export default Navbar;
