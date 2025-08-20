const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Claude Code 프로젝트 검증
 * @param {string} projectPath - 검증할 프로젝트 경로
 * @returns {Promise<Object>} 검증 결과
 */
async function validateClaudeProject(projectPath) {
  const agentsPath = path.join(projectPath, '.claude', 'agents');
  
  try {
    // .claude/agents 디렉토리 존재 확인
    const agentsExists = await fs.pathExists(agentsPath);
    
    if (!agentsExists) {
      return {
        isValid: false,
        reason: 'Claude Code 프로젝트가 아닙니다. .claude/agents 디렉토리가 없습니다.',
        agentsPath: null
      };
    }

    // 디렉토리 읽기 권한 확인
    try {
      await fs.readdir(agentsPath);
    } catch (error) {
      return {
        isValid: false,
        reason: '.claude/agents 디렉토리에 대한 읽기 권한이 없습니다.',
        agentsPath: null
      };
    }

    // 설치된 선생님들 확인
    const installedTeachers = await getInstalledTeachers(agentsPath);
    
    return {
      isValid: true,
      agentsPath,
      installedTeachers,
      projectPath
    };

  } catch (error) {
    return {
      isValid: false,
      reason: `프로젝트 검증 중 오류 발생: ${error.message}`,
      agentsPath: null
    };
  }
}

/**
 * 설치된 선생님 목록 조회
 * @param {string} agentsPath - agents 디렉토리 경로
 * @returns {Promise<Array>} 설치된 선생님 목록
 */
async function getInstalledTeachers(agentsPath) {
  try {
    const files = await fs.readdir(agentsPath);
    const teacherFiles = files.filter(file => 
      file.endsWith('-teacher.md') && (file.startsWith('data-') || file.startsWith('ai-'))
    );
    
    return teacherFiles.map(file => {
      const teacherName = file.replace('-teacher.md', '');
      return {
        name: teacherName,
        fileName: file,
        fullPath: path.join(agentsPath, file)
      };
    });
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  설치된 선생님 확인 중 오류: ${error.message}`));
    return [];
  }
}

/**
 * 설치 전 사전 검증
 * @param {string} agentsPath - agents 디렉토리 경로
 * @param {Array} teachersToInstall - 설치할 선생님 목록
 * @returns {Promise<Object>} 검증 결과
 */
async function validateInstallation(agentsPath, teachersToInstall) {
  const results = {
    canInstall: true,
    warnings: [],
    conflicts: []
  };

  // 쓰기 권한 확인
  try {
    await fs.access(agentsPath, fs.constants.W_OK);
  } catch (error) {
    results.canInstall = false;
    results.warnings.push('agents 디렉토리에 대한 쓰기 권한이 없습니다.');
    return results;
  }

  // 기존 파일 충돌 확인
  for (const teacher of teachersToInstall) {
    const teacherFilePath = path.join(agentsPath, `${teacher}-teacher.md`);
    const exists = await fs.pathExists(teacherFilePath);
    
    if (exists) {
      results.conflicts.push({
        teacher,
        filePath: teacherFilePath
      });
    }
  }

  if (results.conflicts.length > 0) {
    results.warnings.push(`${results.conflicts.length}개의 선생님이 이미 설치되어 있습니다.`);
  }

  return results;
}

module.exports = {
  validateClaudeProject,
  getInstalledTeachers,
  validateInstallation
};