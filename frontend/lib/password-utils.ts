// [개념] bcrypt 단방향 해싱 - salt를 함께 생성해 같은 비밀번호여도 다른 해시 생성. 검증은 compareSync로 (원본 복원 불가) → docs/06-auth-flow.md (#2)
import bcrypt from "bcryptjs";

// salt + hash password
export function saltAndHashPassword(password: string): string {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
}

// DB에 있는 비밀번호 vs 입력받은 비밀번호
export function comparePassword(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}
