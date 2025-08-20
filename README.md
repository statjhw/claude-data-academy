# Claude Data Learning Teachers

Claude Code 프로젝트에 데이터 분야 학습용 선생님 에이전트를 설치하는 NPX CLI 도구입니다.

## 🎓 프로젝트 소개

이 도구는 기존 Claude Code 프로젝트의 `.claude/agents/` 디렉토리에 데이터 분야 **학습 지도 전문 선생님** 에이전트들을 추가합니다. 각 선생님은 완성된 코드를 제공하는 대신, 학습자가 직접 구현할 수 있도록 **단계적 학습 가이드**를 제공합니다.

## 🚀 설치 및 사용법

### NPX로 바로 실행 (권장)

```bash
npx claude-data-learning-teachers
```

### 명령어 옵션

```bash
npx claude-data-learning-teachers                           # 대화형 설치
npx claude-data-learning-teachers --all                     # 모든 선생님 설치
npx claude-data-learning-teachers --teachers data-engineer  # 특정 선생님 설치
npx claude-data-learning-teachers --list                    # 설치된 선생님 목록
npx claude-data-learning-teachers --roadmap                 # 학습 로드맵 생성
```

## 👨‍🏫 제공되는 선생님들

- 📊 **데이터 엔지니어링 선생님** - 파이프라인 구축 학습
- 🏗️ **데이터 아키텍처 선생님** - 설계 사고력 학습
- 📈 **데이터 분석 선생님** - 분석 사고력 학습
- 🔬 **데이터 사이언스 선생님** - ML 개념과 실습
- 🤖 **AI 엔지니어링 선생님** - MLOps 실무 학습

## 📚 교육 철학

각 선생님 에이전트는 다음 원칙을 따릅니다:

1. **코드를 다 짜주지 않기**: 핵심 부분은 학습자가 직접 구현하도록 유도
2. **단계적 학습**: 작은 단위로 나누어 점진적으로 학습
3. **실습 중심**: 이론보다는 직접 해볼 수 있는 과제 제공
4. **힌트와 가이드**: 막힐 때 적절한 힌트 제공
5. **학습 확인**: 각 단계별 이해도 점검

## 🎯 사용 예시

설치 후 Claude Code에서 다음과 같이 선생님을 호출할 수 있습니다:

```
@data-engineering-teacher 안녕하세요, Kafka 학습을 시작하고 싶어요
```

선생님은 바로 답을 주지 않고, 학습자가 스스로 생각할 수 있도록 질문으로 안내합니다.

## 📋 요구사항

- Node.js 16.0.0 이상
- Claude Code 프로젝트 (`.claude/agents/` 디렉토리가 있는 프로젝트)

## 🛠️ 개발

```bash
git clone https://github.com/your-username/claude-data-learning-teachers.git
cd claude-data-learning-teachers
npm install
npm link
claude-data-learning-teachers --help
```

## 📄 라이선스

MIT License