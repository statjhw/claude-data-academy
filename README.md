# 🎓 Claude Data Academy

[![npm version](https://badge.fury.io/js/claude-data-academy.svg)](https://www.npmjs.com/package/claude-data-academy)
[![GitHub stars](https://img.shields.io/github/stars/statjhw/claude-data-academy.svg?style=social&label=Star)](https://github.com/statjhw/claude-data-academy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue.svg)](https://claude.ai)
[![Data Academy](https://img.shields.io/badge/Type-Data%20Academy-brightgreen.svg)](https://github.com/statjhw/claude-data-academy)
[![Korean](https://img.shields.io/badge/Language-한국어-red.svg)](https://github.com/statjhw/claude-data-academy)

Claude Code 프로젝트에 데이터 학습 선생님 에이전트를 설치하는 NPX CLI 도구입니다.

## ✨ 특징

- 🤖 **5명의 전문 선생님**: 데이터 엔지니어링, 아키텍처, 분석, 사이언스, AI 엔지니어링
- 🎯 **소크라테스식 교육**: 답을 주지 않고 스스로 학습하도록 가이드
- 📝 **TODO 기반 실습**: 단계별 코드 템플릿으로 실무 경험
- 🔧 **Claude Code 통합**: `.claude/agents/` 디렉토리에 자동 설치

## 🚀 빠른 시작

### Claude Code 프로젝트에서 실행

```bash
# 대화형 설치 (권장)
npx claude-data-academy

# 모든 선생님 설치
npx claude-data-academy --all

# 특정 선생님만 설치
npx claude-data-academy --teachers data-engineer

# 설치된 선생님 확인
npx claude-data-academy --list

# 학습 로드맵 생성
npx claude-data-academy --roadmap
```

## 👨‍🏫 선생님 소개

### 📊 데이터 엔지니어링 선생님 (`@data-engineer-teacher`)
- **전문 분야**: ETL 파이프라인, Kafka, Airflow, 실시간 데이터 처리
- **학습 방식**: TODO 기반 파이프라인 구축 실습

### 🏗️ 데이터 아키텍처 선생님 (`@data-architect-teacher`)
- **전문 분야**: 시스템 설계, 확장성, 마이크로서비스, 성능 최적화
- **학습 방식**: 요구사항 분석부터 시작하는 설계 프로세스

### 📈 데이터 분석 선생님 (`@data-analyst-teacher`)
- **전문 분야**: SQL, 통계 분석, A/B 테스트, 비즈니스 인사이트
- **학습 방식**: 가설 검증 중심의 분석 사고

### 🔬 데이터 사이언스 선생님 (`@data-scientist-teacher`)
- **전문 분야**: 머신러닝, 모델링, 피처 엔지니어링, 모델 평가
- **학습 방식**: 문제 정의부터 배포까지 전체 파이프라인

### 🤖 AI 엔지니어링 선생님 (`@ai-engineer-teacher`)
- **전문 분야**: MLOps, 모델 배포, 모니터링, CI/CD 파이프라인
- **학습 방식**: 프로덕션 관점의 ML 시스템 구축

## 📚 학습 특징

### 소크라테스식 교육법
```
❌ "Kafka 파티션은 컨슈머 수의 2-3배로 설정하세요"
✅ "처리할 메시지 양은? 컨슈머 확장 계획은? 순서가 중요한가요?"
```

### TODO 기반 실습
```python
# TODO: Kafka 컨슈머 생성
# 힌트: bootstrap_servers와 group_id 필요
consumer = KafkaConsumer(
    # 여기를 구현해보세요
)
```

### 맞춤형 학습 계획
- 경험 수준별 커리큘럼 (초급/중급/고급)
- 개인화된 학습 로드맵 생성
- 진도 추적 및 체크포인트

## 🛠️ 요구사항

- Node.js >= 16.0.0

## 📖 사용법

### 1. 대화형 설치
```bash
npx claude-data-academy
```

### 2. 선생님 호출
Claude Code에서 다음과 같이 호출:
```
@data-engineer-teacher 안녕하세요! Kafka를 배우고 싶어요
@data-architect-teacher 대용량 시스템 설계 방법을 알려주세요
@data-analyst-teacher 매출 감소 원인을 분석하고 싶어요
```

### 3. 학습 진행
- TODO 기반 과제 수행
- 소크라테스식 질문에 답변
- 체크포인트에서 이해도 확인

## 📁 설치되는 파일

```
.claude/agents/
├── data-engineer-teacher.md      # 데이터 엔지니어링 선생님
├── data-architect-teacher.md     # 데이터 아키텍처 선생님  
├── data-analyst-teacher.md       # 데이터 분석 선생님
├── data-scientist-teacher.md     # 데이터 사이언스 선생님
├── ai-engineer-teacher.md        # AI 엔지니어링 선생님
├── LEARNING_ROADMAP.md           # 개인화된 학습 로드맵
└── progress.json                 # 학습 진도 추적
```

## 🎯 학습 목표

### 실무 스킬 습득
- 현업에서 바로 활용 가능한 기술 스택
- Best Practice 기반 코드 패턴
- 문제 해결 중심 사고법

### 체계적 성장
- 기초부터 고급까지 단계적 학습
- 프로젝트 기반 포트폴리오 구축
- 실무진과 소통하는 언어 습득


## 📄 라이선스

MIT License - 자유롭게 사용하세요!

---

**시작해보세요**: `npx claude-data-academy` 🚀