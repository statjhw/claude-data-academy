const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { validateInstallation } = require('./validator');
const { 
  isValidTeacher, 
  isValidLevel, 
  getTeacherInfo, 
  getLevelInfo,
  getCurrentDate,
  writeJsonFile,
  readJsonFile,
  copyFileWithLogging,
  ensureDirectoryWithLogging 
} = require('./utils');

/**
 * 선생님 에이전트들 설치
 * @param {Array} teacherNames - 설치할 선생님 목록
 * @param {string} level - 학습 수준 (beginner, intermediate, advanced)
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {Object} options - 추가 옵션
 */
async function installTeachers(teacherNames, level, agentsPath, options = {}) {
  const { verbose = false, force = false } = options;
  
  console.log(chalk.blue('\n📦 선생님 설치를 시작합니다...\n'));

  // 입력 검증
  const invalidTeachers = teacherNames.filter(name => !isValidTeacher(name));
  if (invalidTeachers.length > 0) {
    throw new Error(`유효하지 않은 선생님: ${invalidTeachers.join(', ')}`);
  }

  if (!isValidLevel(level)) {
    throw new Error(`유효하지 않은 학습 수준: ${level}`);
  }

  // 설치 전 검증
  const validation = await validateInstallation(agentsPath, teacherNames);
  
  if (!validation.canInstall) {
    throw new Error(validation.warnings.join(', '));
  }

  // 충돌 처리
  if (validation.conflicts.length > 0 && !force) {
    console.log(chalk.yellow('⚠️  다음 선생님들이 이미 설치되어 있습니다:'));
    validation.conflicts.forEach(conflict => {
      const teacherInfo = getTeacherInfo(conflict.teacher);
      console.log(chalk.yellow(`   ${teacherInfo.emoji} ${teacherInfo.name}`));
    });
    console.log(chalk.gray('   덮어쓰려면 --force 옵션을 사용하세요.\n'));
  }

  // 실제 설치 진행
  const installResults = [];
  const levelInfo = getLevelInfo(level);

  for (const teacherName of teacherNames) {
    const teacherInfo = getTeacherInfo(teacherName);
    
    try {
      console.log(chalk.cyan(`📚 ${teacherInfo.emoji} ${teacherInfo.name} 설치 중...`));
      
      // 선생님 파일 설치
      await installSingleTeacher(teacherName, level, agentsPath, verbose);
      
      installResults.push({
        teacher: teacherName,
        success: true,
        info: teacherInfo
      });
      
      console.log(chalk.green(`✅ ${teacherInfo.name} 설치 완료`));
      
    } catch (error) {
      console.error(chalk.red(`❌ ${teacherInfo.name} 설치 실패: ${error.message}`));
      installResults.push({
        teacher: teacherName,
        success: false,
        error: error.message,
        info: teacherInfo
      });
    }
  }

  // 학습 가이드 생성
  console.log(chalk.cyan('\n📋 학습 가이드 생성 중...'));
  await generateLearningGuide(agentsPath, installResults, level);

  // 진도 추적 파일 생성/업데이트
  console.log(chalk.cyan('📊 진도 추적 시스템 설정 중...'));
  await initializeProgressTracking(agentsPath, installResults, level);

  // 설치 완료 메시지
  const successCount = installResults.filter(r => r.success).length;
  const failCount = installResults.length - successCount;
  
  console.log(chalk.green(`\n🎉 설치 완료!`));
  console.log(chalk.green(`✅ 성공: ${successCount}개`));
  if (failCount > 0) {
    console.log(chalk.red(`❌ 실패: ${failCount}개`));
  }
  
  console.log(chalk.blue(`\n🎯 학습 시작!`));
  console.log(chalk.gray('   예: "@data-engineering-teacher 안녕하세요, 첫 수업을 시작하고 싶어요"'));
  console.log(chalk.gray(`\n📚 학습 가이드: ${path.join(agentsPath, 'LEARNING_GUIDE.md')}`));
  console.log(chalk.gray(`📊 진도 체크: ${path.join(agentsPath, 'progress.json')}`));

  return installResults;
}

/**
 * 단일 선생님 설치
 * @param {string} teacherName - 선생님 이름
 * @param {string} level - 학습 수준
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {boolean} verbose - 상세 로그
 */
async function installSingleTeacher(teacherName, level, agentsPath, verbose = false) {
  const teacherInfo = getTeacherInfo(teacherName);
  const teachersDir = path.join(__dirname, '..', 'teachers');
  const sourceFile = path.join(teachersDir, teacherInfo.fileName);
  const destFile = path.join(agentsPath, teacherInfo.fileName);

  // 템플릿 파일 읽기
  if (!await fs.pathExists(sourceFile)) {
    throw new Error(`선생님 템플릿 파일을 찾을 수 없습니다: ${sourceFile}`);
  }

  // 파일 복사
  await copyFileWithLogging(sourceFile, destFile, verbose);
  
  if (verbose) {
    console.log(chalk.gray(`  📝 ${teacherInfo.name} 파일 생성 완료`));
  }
}

/**
 * 학습 가이드 생성
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {Array} installResults - 설치 결과
 * @param {string} level - 학습 수준
 */
async function generateLearningGuide(agentsPath, installResults, level) {
  const guidePath = path.join(agentsPath, 'LEARNING_GUIDE.md');
  const levelInfo = getLevelInfo(level);
  const successfulInstalls = installResults.filter(r => r.success);
  
  let content = `# 📚 데이터 학습 가이드

설치일: ${getCurrentDate()}
학습 수준: ${levelInfo.emoji} ${levelInfo.name} - ${levelInfo.description}

## 설치된 선생님들

`;

  successfulInstalls.forEach(result => {
    const info = result.info;
    content += `- ${info.emoji} **${info.name}** - ${info.description}\n`;
  });

  content += `
## 학습 원칙

### 🚫 선생님들이 하지 않는 것
- 완성된 코드를 바로 제공하지 않음
- 답을 직접적으로 알려주지 않음
- 대신 해서 주지 않음

### ✅ 선생님들이 하는 것  
- 단계적 학습 가이드 제공
- 적절한 힌트와 질문으로 사고 유도
- 스스로 구현할 수 있도록 도움
- 코드 리뷰와 개선 방향 제시
- 학습 진도 체크와 피드백

## 효과적인 학습 방법

1. **주도적 학습**: 선생님이 주는 과제를 스스로 해결해보기
2. **질문하기**: 막힐 때 "이 부분이 왜 안 될까요?" 보다는 "이렇게 해봤는데 어떻게 생각하세요?"
3. **코드 공유**: 작성한 코드를 공유하고 리뷰 받기
4. **진도 체크**: 각 단계별 체크포인트 확인하기

## 사용 예시

\`\`\`
학습자: "@data-engineering-teacher 안녕하세요, Kafka 학습을 시작하고 싶어요"

선생님: "안녕하세요! Kafka 학습을 시작하기 전에 몇 가지 질문드릴게요.
1. 메시지 큐를 사용해본 경험이 있나요?
2. 실시간 처리가 왜 필요한지 생각해본 적 있나요?
3. 어떤 상황에서 Kafka를 써보고 싶으신가요?

이 질문들에 답하시면서 Kafka의 필요성부터 차근차근 이해해봐요!"
\`\`\`
`;

  await fs.writeFile(guidePath, content, 'utf-8');
}

/**
 * 진도 추적 시스템 초기화
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {Array} installResults - 설치 결과
 * @param {string} level - 학습 수준
 */
async function initializeProgressTracking(agentsPath, installResults, level) {
  const progressPath = path.join(agentsPath, 'progress.json');
  const currentDate = getCurrentDate();
  
  // 기존 진도 파일 읽기
  let progressData = await readJsonFile(progressPath) || {
    learner: {
      level: level,
      startDate: currentDate,
      currentWeek: 1
    },
    teachers: {},
    achievements: []
  };

  // 새로 설치된 선생님들 추가
  const successfulInstalls = installResults.filter(r => r.success);
  
  successfulInstalls.forEach(result => {
    const teacherKey = result.teacher.replace('-', '_');
    
    if (!progressData.teachers[teacherKey]) {
      progressData.teachers[teacherKey] = {
        enrolled: true,
        enrollDate: currentDate,
        currentTopic: getInitialTopic(result.teacher, level),
        progress: 0,
        completedTasks: 0,
        totalTasks: getTotalTasksForLevel(level)
      };
    }
  });

  // 설치 달성 기록
  if (successfulInstalls.length > 0) {
    progressData.achievements.push({
      title: `${successfulInstalls.length}명의 선생님과 학습 시작`,
      date: currentDate,
      teachers: successfulInstalls.map(r => r.teacher)
    });
  }

  await writeJsonFile(progressPath, progressData);
}

/**
 * 학습 수준별 초기 주제 반환
 * @param {string} teacherName - 선생님 이름
 * @param {string} level - 학습 수준
 * @returns {string} 초기 주제
 */
function getInitialTopic(teacherName, level) {
  const topics = {
    'data-engineer': {
      'beginner': 'etl-basics',
      'intermediate': 'pipeline-design',
      'advanced': 'distributed-systems'
    },
    'data-architect': {
      'beginner': 'data-modeling-basics',
      'intermediate': 'architecture-patterns',
      'advanced': 'scalable-architecture'
    },
    'data-analyst': {
      'beginner': 'sql-fundamentals',
      'intermediate': 'advanced-analytics',
      'advanced': 'statistical-modeling'
    },
    'data-scientist': {
      'beginner': 'ml-fundamentals',
      'intermediate': 'model-development',
      'advanced': 'advanced-ml'
    },
    'ai-engineer': {
      'beginner': 'mlops-basics',
      'intermediate': 'deployment-strategies',
      'advanced': 'production-optimization'
    }
  };

  return topics[teacherName]?.[level] || 'introduction';
}

/**
 * 학습 수준별 총 과제 수 반환
 * @param {string} level - 학습 수준
 * @returns {number} 총 과제 수
 */
function getTotalTasksForLevel(level) {
  const taskCounts = {
    'beginner': 8,
    'intermediate': 12,
    'advanced': 16
  };
  
  return taskCounts[level] || 10;
}

module.exports = {
  installTeachers,
  installSingleTeacher,
  generateLearningGuide,
  initializeProgressTracking
};