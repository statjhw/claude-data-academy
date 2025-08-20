const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getInstalledTeachers } = require('./validator');
const { 
  readJsonFile,
  getTeacherInfo,
  createProgressBar,
  getCurrentDate 
} = require('./utils');

/**
 * 설치된 선생님 목록 표시
 * @param {string} agentsPath - agents 디렉토리 경로
 */
async function listInstalledTeachers(agentsPath) {
  console.log(chalk.blue('\n📋 설치된 선생님 목록\n'));
  
  try {
    const installedTeachers = await getInstalledTeachers(agentsPath);
    
    if (installedTeachers.length === 0) {
      console.log(chalk.yellow('설치된 선생님이 없습니다.'));
      console.log(chalk.gray('npx claude-data-learning-teachers를 실행하여 선생님을 설치하세요.'));
      return;
    }

    // 진도 정보 로드
    const progressPath = path.join(agentsPath, 'progress.json');
    const progressData = await readJsonFile(progressPath);

    installedTeachers.forEach(teacher => {
      const teacherInfo = getTeacherInfo(teacher.name);
      const teacherKey = teacher.name.replace('-', '_');
      const progress = progressData?.teachers?.[teacherKey];
      
      console.log(`${teacherInfo.emoji} ${chalk.cyan(teacherInfo.name)}`);
      console.log(`   ${chalk.gray(teacherInfo.description)}`);
      
      if (progress) {
        console.log(`   진도: ${createProgressBar(progress.progress)} ${progress.progress}%`);
        console.log(`   현재 주제: ${chalk.yellow(progress.currentTopic)}`);
        console.log(`   완료 과제: ${progress.completedTasks}/${progress.totalTasks}`);
      }
      
      console.log(`   파일: ${chalk.gray(teacher.fileName)}`);
      console.log();
    });

    // 학습 통계
    if (progressData) {
      displayLearningStats(progressData);
    }

  } catch (error) {
    console.error(chalk.red('❌ 선생님 목록을 가져오는 중 오류가 발생했습니다:'), error.message);
  }
}

/**
 * 학습 통계 표시
 * @param {Object} progressData - 진도 데이터
 */
function displayLearningStats(progressData) {
  console.log(chalk.blue('📊 학습 통계'));
  console.log(`학습 시작일: ${chalk.cyan(progressData.learner.startDate)}`);
  console.log(`현재 주차: ${chalk.cyan(progressData.learner.currentWeek)}주차`);
  console.log(`학습 수준: ${chalk.cyan(progressData.learner.level)}`);
  
  const totalTeachers = Object.keys(progressData.teachers).length;
  const totalProgress = Object.values(progressData.teachers)
    .reduce((sum, teacher) => sum + teacher.progress, 0) / totalTeachers;
  
  console.log(`전체 진도: ${createProgressBar(totalProgress)} ${totalProgress.toFixed(1)}%`);
  
  if (progressData.achievements && progressData.achievements.length > 0) {
    console.log('\n🏆 달성 기록:');
    progressData.achievements.slice(-3).forEach(achievement => {
      console.log(`   ${chalk.green('✅')} ${achievement.title} (${achievement.date})`);
    });
  }
}

/**
 * 학습 로드맵 생성
 * @param {string} agentsPath - agents 디렉토리 경로
 */
async function generateLearningRoadmap(agentsPath) {
  console.log(chalk.blue('\n🗺️  개인 맞춤 학습 로드맵 생성\n'));
  
  try {
    const installedTeachers = await getInstalledTeachers(agentsPath);
    const progressPath = path.join(agentsPath, 'progress.json');
    const progressData = await readJsonFile(progressPath);
    
    if (!progressData) {
      console.log(chalk.yellow('진도 데이터가 없습니다. 먼저 선생님을 설치해주세요.'));
      return;
    }

    const roadmapPath = path.join(agentsPath, 'LEARNING_ROADMAP.md');
    const roadmapContent = await generateRoadmapContent(installedTeachers, progressData);
    
    await fs.writeFile(roadmapPath, roadmapContent, 'utf-8');
    
    console.log(chalk.green('✅ 학습 로드맵이 생성되었습니다!'));
    console.log(chalk.gray(`📄 파일 위치: ${roadmapPath}`));
    
    // 로드맵 미리보기
    console.log(chalk.blue('\n📋 로드맵 미리보기:'));
    await displayRoadmapPreview(installedTeachers, progressData);

  } catch (error) {
    console.error(chalk.red('❌ 로드맵 생성 중 오류가 발생했습니다:'), error.message);
  }
}

/**
 * 로드맵 내용 생성
 * @param {Array} installedTeachers - 설치된 선생님 목록
 * @param {Object} progressData - 진도 데이터
 * @returns {string} 로드맵 마크다운 내용
 */
async function generateRoadmapContent(installedTeachers, progressData) {
  const currentDate = getCurrentDate();
  const level = progressData.learner.level;
  
  let content = `# 🗺️ 개인 맞춤 학습 로드맵

생성일: ${currentDate}
학습자 수준: ${level}
설치된 선생님: ${installedTeachers.length}명

## 📊 현재 학습 현황

`;

  // 각 선생님별 현황
  installedTeachers.forEach(teacher => {
    const teacherInfo = getTeacherInfo(teacher.name);
    const teacherKey = teacher.name.replace('-', '_');
    const progress = progressData.teachers[teacherKey];
    
    content += `### ${teacherInfo.emoji} ${teacherInfo.name}

**현재 진도**: ${createProgressBar(progress.progress)} ${progress.progress}%
**현재 주제**: ${progress.currentTopic}
**완료 과제**: ${progress.completedTasks}/${progress.totalTasks}

`;
  });

  content += `## 🎯 추천 학습 순서

`;

  // 학습 순서 추천
  const recommendedOrder = getRecommendedLearningOrder(installedTeachers, level);
  
  recommendedOrder.forEach((step, index) => {
    content += `### ${index + 1}단계: ${step.emoji} ${step.name}

**예상 기간**: ${step.duration}
**주요 학습 목표**:
${step.goals.map(goal => `- ${goal}`).join('\n')}

**핵심 과제**:
${step.tasks.map(task => `- [ ] ${task}`).join('\n')}

`;
  });

  content += `## 📅 학습 계획

### 주차별 목표

`;

  // 주차별 계획
  for (let week = 1; week <= 12; week++) {
    const weeklyPlan = getWeeklyPlan(week, level, installedTeachers);
    content += `**${week}주차**: ${weeklyPlan.title}
- ${weeklyPlan.description}

`;
  }

  content += `## 🏆 마일스톤

`;

  // 마일스톤 정의
  const milestones = getMilestones(level);
  milestones.forEach(milestone => {
    const completed = progressData.achievements.some(a => a.title.includes(milestone.title));
    const status = completed ? '✅' : '⭕';
    content += `${status} **${milestone.title}** (${milestone.week}주차)
   ${milestone.description}

`;
  });

  return content;
}

/**
 * 로드맵 미리보기 표시
 * @param {Array} installedTeachers - 설치된 선생님 목록
 * @param {Object} progressData - 진도 데이터
 */
async function displayRoadmapPreview(installedTeachers, progressData) {
  const level = progressData.learner.level;
  const recommendedOrder = getRecommendedLearningOrder(installedTeachers, level);
  
  console.log(chalk.yellow('🎯 추천 학습 순서:'));
  recommendedOrder.slice(0, 3).forEach((step, index) => {
    console.log(`   ${index + 1}. ${step.emoji} ${step.name} (${step.duration})`);
  });
  
  console.log(chalk.yellow('\n📅 이번 주 목표:'));
  const currentWeek = progressData.learner.currentWeek;
  const weeklyPlan = getWeeklyPlan(currentWeek, level, installedTeachers);
  console.log(`   ${weeklyPlan.title}`);
  console.log(`   ${chalk.gray(weeklyPlan.description)}`);
}

/**
 * 추천 학습 순서 생성
 * @param {Array} installedTeachers - 설치된 선생님 목록
 * @param {string} level - 학습 수준
 * @returns {Array} 추천 순서
 */
function getRecommendedLearningOrder(installedTeachers, level) {
  const orderTemplates = {
    'beginner': [
      {
        name: '데이터 엔지니어링 기초',
        emoji: '📊',
        duration: '2-3주',
        goals: ['ETL 개념 이해', '파이프라인 기초 구현'],
        tasks: ['CSV to Database ETL 스크립트', '간단한 데이터 검증 로직']
      },
      {
        name: '데이터 분석 기초',
        emoji: '📈',
        duration: '2-3주',
        goals: ['SQL 기초 마스터', '탐색적 데이터 분석'],
        tasks: ['복잡한 JOIN 쿼리 작성', '데이터 시각화 대시보드']
      },
      {
        name: '데이터 아키텍처 설계',
        emoji: '🏗️',
        duration: '3-4주',
        goals: ['ERD 설계', '데이터 모델링'],
        tasks: ['실제 비즈니스 ERD 설계', '정규화/비정규화 결정']
      }
    ],
    'intermediate': [
      {
        name: '실시간 데이터 처리',
        emoji: '📊',
        duration: '3-4주',
        goals: ['Kafka 마스터', '스트림 처리 구현'],
        tasks: ['실시간 로그 처리 파이프라인', 'Kafka Connect 설정']
      },
      {
        name: 'ML 파이프라인 구축',
        emoji: '🔬',
        duration: '4-5주',
        goals: ['MLOps 기초', '모델 배포'],
        tasks: ['Feature Store 구축', '모델 서빙 API']
      }
    ],
    'advanced': [
      {
        name: '분산 시스템 아키텍처',
        emoji: '🏗️',
        duration: '4-6주',
        goals: ['대용량 처리 설계', '성능 최적화'],
        tasks: ['샤딩 전략 설계', '분산 캐시 구현']
      }
    ]
  };

  return orderTemplates[level] || orderTemplates['intermediate'];
}

/**
 * 주차별 계획 생성
 * @param {number} week - 주차
 * @param {string} level - 학습 수준
 * @param {Array} installedTeachers - 설치된 선생님 목록
 * @returns {Object} 주차별 계획
 */
function getWeeklyPlan(week, level, installedTeachers) {
  const plans = {
    1: { title: '학습 환경 설정 및 기초 개념', description: '개발 환경 구축과 기본 개념 이해' },
    2: { title: '첫 번째 실습 프로젝트', description: '간단한 ETL 파이프라인 구축' },
    3: { title: '데이터 품질 관리', description: '데이터 검증 및 클렌징 로직 구현' },
    4: { title: 'SQL 심화 학습', description: '복잡한 쿼리 작성 및 최적화' },
    5: { title: '데이터 시각화', description: '대시보드 구축 및 인사이트 도출' },
    6: { title: 'API 연동 및 자동화', description: '외부 API 데이터 수집 자동화' },
    7: { title: '실시간 처리 입문', description: 'Kafka 기초 및 스트림 처리' },
    8: { title: '클라우드 서비스 활용', description: 'AWS/GCP 데이터 서비스 활용' },
    9: { title: '머신러닝 파이프라인', description: 'ML 모델 훈련 및 배포' },
    10: { title: '모니터링 및 알람', description: '시스템 모니터링 구축' },
    11: { title: '성능 최적화', description: '파이프라인 성능 튜닝' },
    12: { title: '프로젝트 완성 및 리뷰', description: '전체 프로젝트 통합 및 회고' }
  };

  return plans[week] || { title: '심화 학습', description: '개인별 관심 분야 심화 학습' };
}

/**
 * 마일스톤 정의
 * @param {string} level - 학습 수준
 * @returns {Array} 마일스톤 목록
 */
function getMilestones(level) {
  return [
    { title: '첫 ETL 스크립트 완성', week: 2, description: 'CSV 파일을 데이터베이스로 전송하는 스크립트 완성' },
    { title: '첫 대시보드 구축', week: 5, description: '실제 데이터를 활용한 시각화 대시보드 완성' },
    { title: '실시간 파이프라인 구축', week: 8, description: 'Kafka를 활용한 실시간 데이터 처리 파이프라인 완성' },
    { title: 'ML 모델 배포', week: 10, description: '머신러닝 모델을 실제 서비스에 배포' },
    { title: '전체 프로젝트 완성', week: 12, description: '엔드투엔드 데이터 플랫폼 구축 완성' }
  ];
}

module.exports = {
  listInstalledTeachers,
  generateLearningRoadmap,
  displayLearningStats,
  displayRoadmapPreview
};