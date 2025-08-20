const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * 사용 가능한 선생님 목록
 */
const AVAILABLE_TEACHERS = {
  'data-engineer': {
    name: '데이터 엔지니어링 선생님',
    emoji: '📊',
    description: '파이프라인 구축 학습',
    fileName: 'data-engineer-teacher.md'
  },
  'data-architect': {
    name: '데이터 아키텍처 선생님',
    emoji: '🏗️',
    description: '설계 사고력 학습',
    fileName: 'data-architect-teacher.md'
  },
  'data-analyst': {
    name: '데이터 분석 선생님',
    emoji: '📈',
    description: '분석 사고력 학습',
    fileName: 'data-analyst-teacher.md'
  },
  'data-scientist': {
    name: '데이터 사이언스 선생님',
    emoji: '🔬',
    description: 'ML 개념과 실습',
    fileName: 'data-scientist-teacher.md'
  },
  'ai-engineer': {
    name: 'AI 엔지니어링 선생님',
    emoji: '🤖',
    description: 'MLOps 실무 학습',
    fileName: 'ai-engineer-teacher.md'
  }
};

/**
 * 학습 수준 정의
 */
const LEARNING_LEVELS = {
  'beginner': {
    name: '초급',
    emoji: '🌱',
    description: '기초 개념부터 차근차근'
  },
  'intermediate': {
    name: '중급',
    emoji: '🌿',
    description: '실무 프로젝트 중심 학습'
  },
  'advanced': {
    name: '고급',
    emoji: '🌳',
    description: '심화 주제와 최적화'
  }
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} 날짜 문자열
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 진행률 바 생성
 * @param {number} progress - 진행률 (0-100)
 * @param {number} width - 바의 전체 너비
 * @returns {string} 진행률 바 문자열
 */
function createProgressBar(progress, width = 20) {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

/**
 * 템플릿 파일에서 변수 치환
 * @param {string} templateContent - 템플릿 내용
 * @param {Object} variables - 치환할 변수들
 * @returns {string} 치환된 내용
 */
function replaceTemplateVariables(templateContent, variables) {
  let result = templateContent;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return result;
}

/**
 * 파일 복사 with 로깅
 * @param {string} source - 원본 파일 경로
 * @param {string} destination - 대상 파일 경로
 * @param {boolean} verbose - 상세 로그 여부
 */
async function copyFileWithLogging(source, destination, verbose = false) {
  try {
    await fs.copy(source, destination);
    if (verbose) {
      console.log(chalk.gray(`  📄 ${path.basename(destination)} 복사 완료`));
    }
  } catch (error) {
    console.error(chalk.red(`❌ 파일 복사 실패: ${source} -> ${destination}`));
    throw error;
  }
}

/**
 * 디렉토리 생성 with 로깅
 * @param {string} dirPath - 생성할 디렉토리 경로
 * @param {boolean} verbose - 상세 로그 여부
 */
async function ensureDirectoryWithLogging(dirPath, verbose = false) {
  try {
    await fs.ensureDir(dirPath);
    if (verbose) {
      console.log(chalk.gray(`  📁 ${path.basename(dirPath)} 디렉토리 생성`));
    }
  } catch (error) {
    console.error(chalk.red(`❌ 디렉토리 생성 실패: ${dirPath}`));
    throw error;
  }
}

/**
 * JSON 파일 읽기
 * @param {string} filePath - JSON 파일 경로
 * @returns {Promise<Object>} 파싱된 JSON 객체
 */
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // 파일이 없으면 null 반환
    }
    throw error;
  }
}

/**
 * JSON 파일 쓰기
 * @param {string} filePath - JSON 파일 경로
 * @param {Object} data - 저장할 데이터
 * @param {boolean} pretty - 들여쓰기 여부
 */
async function writeJsonFile(filePath, data, pretty = true) {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 유효한 선생님 이름인지 확인
 * @param {string} teacherName - 선생님 이름
 * @returns {boolean} 유효 여부
 */
function isValidTeacher(teacherName) {
  return Object.keys(AVAILABLE_TEACHERS).includes(teacherName);
}

/**
 * 유효한 학습 수준인지 확인
 * @param {string} level - 학습 수준
 * @returns {boolean} 유효 여부
 */
function isValidLevel(level) {
  return Object.keys(LEARNING_LEVELS).includes(level);
}

/**
 * 선생님 정보 가져오기
 * @param {string} teacherName - 선생님 이름
 * @returns {Object|null} 선생님 정보
 */
function getTeacherInfo(teacherName) {
  return AVAILABLE_TEACHERS[teacherName] || null;
}

/**
 * 학습 수준 정보 가져오기
 * @param {string} level - 학습 수준
 * @returns {Object|null} 수준 정보
 */
function getLevelInfo(level) {
  return LEARNING_LEVELS[level] || null;
}

module.exports = {
  AVAILABLE_TEACHERS,
  LEARNING_LEVELS,
  getCurrentDate,
  createProgressBar,
  replaceTemplateVariables,
  copyFileWithLogging,
  ensureDirectoryWithLogging,
  readJsonFile,
  writeJsonFile,
  isValidTeacher,
  isValidLevel,
  getTeacherInfo,
  getLevelInfo
};