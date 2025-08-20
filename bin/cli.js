#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { installTeachers } = require('../lib/installer');
const { validateClaudeProject } = require('../lib/validator');
const { listInstalledTeachers, generateLearningRoadmap } = require('../lib/teachers-manager');
const { runInteractiveInstaller } = require('../lib/interactive');

const program = new Command();

// ASCII Art 로고
const logo = `
${chalk.blue('🎓 Claude Data Learning Teachers')}
${chalk.gray('데이터 분야 학습용 선생님 에이전트 설치 도구')}
`;

program
  .name('claude-data-learning-teachers')
  .description('Claude Code 프로젝트에 데이터 학습 선생님 에이전트를 설치합니다')
  .version('1.0.0')
  .option('-a, --all', '모든 선생님 설치')
  .option('-t, --teachers <names>', '특정 선생님들 설치 (쉼표로 구분)')
  .option('-l, --list', '설치된 선생님 목록 표시')
  .option('-r, --roadmap', '학습 로드맵 생성')
  .option('--verbose', '상세한 로그 출력');

program.action(async (options) => {
  console.log(logo);
  
  try {
    // Claude Code 프로젝트 검증
    const projectInfo = await validateClaudeProject(process.cwd());
    
    if (!projectInfo.isValid) {
      console.error(chalk.red('❌ Claude Code 프로젝트를 찾을 수 없습니다.'));
      console.error(chalk.yellow('💡 Claude Code 프로젝트 디렉토리에서 실행해주세요.'));
      process.exit(1);
    }

    console.log(chalk.green('✅ Claude Code 프로젝트를 확인했습니다!'));
    console.log(chalk.gray(`📁 현재 위치: ${process.cwd()}`));
    console.log();

    // 옵션에 따른 실행
    if (options.list) {
      await listInstalledTeachers(projectInfo.agentsPath);
    } else if (options.roadmap) {
      await generateLearningRoadmap(projectInfo.agentsPath);
    } else if (options.all) {
      const allTeachers = ['data-engineer', 'data-architect', 'data-analyst', 'data-scientist', 'ai-engineer'];
      await installTeachers(allTeachers, 'intermediate', projectInfo.agentsPath);
    } else if (options.teachers) {
      const teacherList = options.teachers.split(',').map(t => t.trim());
      await installTeachers(teacherList, 'intermediate', projectInfo.agentsPath);
    } else {
      // 대화형 설치
      await runInteractiveInstaller(projectInfo.agentsPath);
    }

  } catch (error) {
    console.error(chalk.red('❌ 오류가 발생했습니다:'), error.message);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
});

// 도움말 커스터마이징
program.on('--help', () => {
  console.log();
  console.log(chalk.yellow('사용 예시:'));
  console.log('  $ npx claude-data-learning-teachers');
  console.log('  $ npx claude-data-learning-teachers --all');
  console.log('  $ npx claude-data-learning-teachers --teachers data-engineer,data-scientist');
  console.log('  $ npx claude-data-learning-teachers --list');
  console.log();
  console.log(chalk.yellow('제공되는 선생님들:'));
  console.log('  📊 data-engineer    - 데이터 엔지니어링 선생님');
  console.log('  🏗️  data-architect   - 데이터 아키텍처 선생님');
  console.log('  📈 data-analyst     - 데이터 분석 선생님');
  console.log('  🔬 data-scientist   - 데이터 사이언스 선생님');
  console.log('  🤖 ai-engineer      - AI 엔지니어링 선생님');
  console.log();
});

program.parse(process.argv);