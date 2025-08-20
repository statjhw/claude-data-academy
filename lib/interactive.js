const inquirer = require('inquirer');
const chalk = require('chalk');
const { installTeachers } = require('./installer');
const { AVAILABLE_TEACHERS, LEARNING_LEVELS } = require('./utils');

/**
 * 대화형 설치 프로세스 실행
 * @param {string} agentsPath - agents 디렉토리 경로
 */
async function runInteractiveInstaller(agentsPath) {
  console.log(chalk.blue('🎓 Claude Code 학습 프로젝트를 탐지했습니다!'));
  console.log(chalk.gray(`📁 현재 위치: ${process.cwd()}\n`));

  try {
    // 1. 선생님 선택
    const teacherChoices = Object.entries(AVAILABLE_TEACHERS).map(([key, teacher]) => ({
      name: `${teacher.emoji} ${teacher.name} - ${teacher.description}`,
      value: key,
      checked: false
    }));

    const { selectedTeachers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTeachers',
        message: '어떤 데이터 분야 선생님과 함께 학습하시겠습니까? (다중 선택)',
        choices: teacherChoices,
        validate: (choices) => {
          if (choices.length === 0) {
            return '최소 1명의 선생님을 선택해주세요.';
          }
          return true;
        }
      }
    ]);

    // 2. 학습 수준 선택
    const levelChoices = Object.entries(LEARNING_LEVELS).map(([key, level]) => ({
      name: `${level.emoji} ${level.name} - ${level.description}`,
      value: key
    }));

    const { learningLevel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'learningLevel',
        message: '학습 수준을 선택해주세요:',
        choices: levelChoices
      }
    ]);

    // 3. 설치 확인
    console.log(chalk.blue('\n📋 설치 요약:'));
    console.log(chalk.cyan('선택된 선생님들:'));
    selectedTeachers.forEach(teacherId => {
      const teacher = AVAILABLE_TEACHERS[teacherId];
      console.log(`  ${teacher.emoji} ${teacher.name}`);
    });
    
    const levelInfo = LEARNING_LEVELS[learningLevel];
    console.log(chalk.cyan(`\n학습 수준: ${levelInfo.emoji} ${levelInfo.name}`));

    const { confirmInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmInstall',
        message: '위 설정으로 선생님들을 설치하시겠습니까?',
        default: true
      }
    ]);

    if (!confirmInstall) {
      console.log(chalk.yellow('설치가 취소되었습니다.'));
      return;
    }

    // 4. 추가 옵션 설정
    const { additionalOptions } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'additionalOptions',
        message: '추가 옵션을 선택하세요:',
        choices: [
          {
            name: '🚀 학습 로드맵 자동 생성',
            value: 'generateRoadmap',
            checked: true
          },
          {
            name: '📊 주간 진도 리포트 설정',
            value: 'weeklyReport',
            checked: false
          },
          {
            name: '💬 학습 팁 및 동기부여 메시지',
            value: 'motivationTips',
            checked: true
          }
        ]
      }
    ]);

    // 5. 실제 설치 진행
    console.log(chalk.blue('\n📦 선생님 설치를 시작합니다...\n'));
    
    const installOptions = {
      verbose: true,
      force: false,
      generateRoadmap: additionalOptions.includes('generateRoadmap'),
      weeklyReport: additionalOptions.includes('weeklyReport'),
      motivationTips: additionalOptions.includes('motivationTips')
    };

    const results = await installTeachers(selectedTeachers, learningLevel, agentsPath, installOptions);

    // 6. 설치 완료 후 추가 작업
    await handlePostInstallation(results, agentsPath, installOptions);

    // 7. 시작 가이드 표시
    displayStartupGuide(selectedTeachers, learningLevel);

  } catch (error) {
    console.error(chalk.red('\n❌ 대화형 설치 중 오류가 발생했습니다:'), error.message);
    throw error;
  }
}

/**
 * 설치 후 추가 작업 처리
 * @param {Array} installResults - 설치 결과
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {Object} options - 설치 옵션
 */
async function handlePostInstallation(installResults, agentsPath, options) {
  const successfulInstalls = installResults.filter(r => r.success);
  
  if (successfulInstalls.length === 0) {
    return;
  }

  // 로드맵 생성
  if (options.generateRoadmap) {
    console.log(chalk.cyan('\n🗺️  개인 맞춤 학습 로드맵 생성 중...'));
    try {
      const { generateLearningRoadmap } = require('./teachers-manager');
      await generateLearningRoadmap(agentsPath);
      console.log(chalk.green('✅ 학습 로드맵 생성 완료'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  로드맵 생성 중 오류:', error.message));
    }
  }

  // 동기부여 메시지 표시
  if (options.motivationTips) {
    displayMotivationMessage(successfulInstalls.length);
  }

  // 주간 리포트 설정
  if (options.weeklyReport) {
    console.log(chalk.cyan('\n📊 주간 진도 리포트 설정...'));
    console.log(chalk.gray('   매주 진도 상황을 확인할 수 있습니다.'));
  }
}

/**
 * 시작 가이드 표시
 * @param {Array} selectedTeachers - 선택된 선생님들
 * @param {string} learningLevel - 학습 수준
 */
function displayStartupGuide(selectedTeachers, learningLevel) {
  console.log(chalk.blue('\n🎯 학습 시작 가이드'));
  console.log(chalk.gray('━'.repeat(50)));
  
  console.log(chalk.yellow('\n📞 선생님 호출 방법:'));
  selectedTeachers.forEach(teacherId => {
    const teacher = AVAILABLE_TEACHERS[teacherId];
    console.log(`   @${teacherId}-teacher 또는 "${teacher.name}"`);
  });

  console.log(chalk.yellow('\n💡 효과적인 학습 팁:'));
  console.log('   1. 선생님께 구체적인 질문하기');
  console.log('   2. 작성한 코드 공유하고 피드백 받기');
  console.log('   3. 각 단계별 체크포인트 확인하기');
  console.log('   4. 막힐 때 힌트 요청하기');

  console.log(chalk.yellow('\n🎓 첫 수업 시작 예시:'));
  const firstTeacher = selectedTeachers[0];
  const teacherInfo = AVAILABLE_TEACHERS[firstTeacher];
  console.log(chalk.cyan(`   "@${firstTeacher}-teacher 안녕하세요, 첫 수업을 시작하고 싶어요"`));
  
  console.log(chalk.yellow('\n📚 유용한 파일들:'));
  console.log('   📖 .claude/agents/LEARNING_GUIDE.md - 전체 학습 가이드');
  console.log('   📊 .claude/agents/progress.json - 학습 진도 추적');
  console.log('   🗺️  .claude/agents/LEARNING_ROADMAP.md - 개인 맞춤 로드맵');

  displayLearningLevelGuidance(learningLevel);
}

/**
 * 학습 수준별 가이드 표시
 * @param {string} learningLevel - 학습 수준
 */
function displayLearningLevelGuidance(learningLevel) {
  const guidanceMap = {
    'beginner': {
      title: '🌱 초급자를 위한 팁',
      tips: [
        '기초 개념부터 차근차근 학습하세요',
        '작은 단위로 나누어서 연습하세요',
        '이해가 안 되면 언제든 질문하세요',
        '매일 조금씩이라도 꾸준히 학습하세요'
      ]
    },
    'intermediate': {
      title: '🌿 중급자를 위한 팁',
      tips: [
        '실무 프로젝트를 만들면서 학습하세요',
        '다양한 기술 스택을 경험해보세요',
        '코드 리뷰를 적극적으로 받아보세요',
        '오픈소스 프로젝트에 기여해보세요'
      ]
    },
    'advanced': {
      title: '🌳 고급자를 위한 팁',
      tips: [
        '성능 최적화와 확장성을 고려하세요',
        '아키텍처 설계에 집중하세요',
        '최신 기술 트렌드를 따라가세요',
        '팀 리딩과 멘토링 역할을 해보세요'
      ]
    }
  };

  const guidance = guidanceMap[learningLevel];
  if (guidance) {
    console.log(chalk.yellow(`\n${guidance.title}:`));
    guidance.tips.forEach((tip, index) => {
      console.log(`   ${index + 1}. ${tip}`);
    });
  }
}

/**
 * 동기부여 메시지 표시
 * @param {number} teacherCount - 설치된 선생님 수
 */
function displayMotivationMessage(teacherCount) {
  const messages = [
    '🚀 훌륭한 선택입니다! 데이터 분야의 전문가가 되어보세요!',
    '💪 꾸준한 학습이 성공의 열쇠입니다. 화이팅!',
    '🎯 목표를 향해 한 걸음씩 나아가세요!',
    '🌟 당신의 데이터 여정을 응원합니다!',
    '📈 매일 조금씩 성장하는 모습을 기대합니다!'
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  console.log(chalk.blue('\n💌 동기부여 메시지'));
  console.log(chalk.cyan(randomMessage));
  console.log(chalk.gray(`${teacherCount}명의 선생님과 함께라면 분명 성공할 수 있습니다! 🎓`));
}

/**
 * 사용자 선호도 조사 (선택사항)
 * @returns {Object} 사용자 선호도 정보
 */
async function collectUserPreferences() {
  const preferences = await inquirer.prompt([
    {
      type: 'list',
      name: 'learningStyle',
      message: '선호하는 학습 스타일은?',
      choices: [
        { name: '🎯 목표 중심 학습 (프로젝트 완성이 목표)', value: 'goal-oriented' },
        { name: '🔄 반복 학습 (개념을 충분히 이해할 때까지)', value: 'repetitive' },
        { name: '🚀 빠른 학습 (최대한 빠르게 실무 투입)', value: 'fast-track' },
        { name: '🎨 창의적 학습 (자유롭게 실험하며)', value: 'creative' }
      ]
    },
    {
      type: 'number',
      name: 'weeklyHours',
      message: '주당 학습 가능 시간은? (시간)',
      default: 10,
      validate: (input) => {
        if (input < 1 || input > 168) {
          return '1시간에서 168시간 사이로 입력해주세요.';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'interests',
      message: '특히 관심 있는 분야는? (다중 선택)',
      choices: [
        { name: '📊 데이터 시각화', value: 'visualization' },
        { name: '🤖 머신러닝', value: 'machine-learning' },
        { name: '☁️  클라우드 플랫폼', value: 'cloud' },
        { name: '⚡ 실시간 처리', value: 'real-time' },
        { name: '🏗️  아키텍처 설계', value: 'architecture' },
        { name: '📈 비즈니스 분석', value: 'business-analytics' }
      ]
    }
  ]);

  return preferences;
}

module.exports = {
  runInteractiveInstaller,
  handlePostInstallation,
  displayStartupGuide,
  collectUserPreferences
};