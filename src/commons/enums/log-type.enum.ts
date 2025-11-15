export enum LogTypeEnum {
  LOGIN_ATTEMPT_FAILED = 'login-attempt-failed',
  LOGIN_ATTEMPT_SUCCESS = 'login-attempt-success',
  USER_REGISTER = 'user-register',

  CREATE_STUDENT_SUCCESS = 'create-student-success',
  CREATE_STUDENT_FAILED = 'create-student-failed',
  UPDATE_STUDENT = 'update-student',
  DELETE_STUDENT = 'delete-student',

  CREATE_CLASS_FAILED = 'create-class-failed',
  CREATE_CLASS_SUCCESS = 'create-class-success',
  UPDATE_CLASS = 'update-class',
  DELETE_CLASS = 'delete-class',

  IMPORT_STUDENT = 'import-student',
  IMPORT_CLASS = 'import-class',

  EDIT_PASSWORD = 'edit-password',
  EDIT_SELF = 'edit-self',
}
