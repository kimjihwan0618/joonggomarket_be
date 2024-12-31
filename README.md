## 중고마켓 백엔드 서버 저장소

### 개요

이 저장소는 중고마켓 서비스의 백엔드 서버 코드 저장소입니다.

- **중고마켓 사이트 주소**: [https://joonggomarket.site](https://joonggomarket.site)
- **GraphQL API Playground**: [https://kimjihodo.synology.me:3459/graphql](https://kimjihodo.synology.me:3459/graphql)

### 사용 기술

![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white) ![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat-square&logo=GraphQL&logoColor=white) ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white) ![Log4js](https://img.shields.io/badge/Log4js-000000?style=flat-square&logoColor=white) ![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?style=flat-square&logo=Amazon%20S3&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=PostgreSQL&logoColor=white) ![PortOne](https://img.shields.io/badge/PortOne-0078D7?style=flat-square&logoColor=white)

### 환경변수

이 프로젝트는 다음과 같은 환경변수들을 사용합니다. `.env` 파일에 값을 설정하여 앱을 구동할 수 있습니다.

- **APP_PORT**: 애플리케이션이 실행될 포트 번호  
  예: `3000`

- **ALLOWED_ORIGINS**: 허용된 도메인 리스트 (CORS 설정에 사용)  
  예: `http://localhost:3000, https://example.com`

- **DOMAIN**: 앱의 기본 도메인 (API 요청 시 사용)  
  예: `yourdomain.com`

- **REDIS_HOST**: Redis 서버 호스트  
  예: `localhost`

- **REDIS_PORT**: Redis 서버 포트  
  예: `6379`

- **IMP_KEY**: PORTONE 서비스 API 키  
  예: `your_imp_key`

- **IMP_SECRET**: PORTONE 서비스 SECRET 키  
  예: `your_imp_secret`

- **AWS_S3_BUCKET**: AWS S3 버킷 이름  
  예: `your-bucket-name`

- **AWS_REGION**: AWS 리전 (예: `us-west-2`)  
  예: `us-east-1`

- **AWS_ACCESS_KEY_ID**: AWS 액세스 키 ID  
  예: `your_aws_access_key`

- **AWS_SECRET_ACCESS_KEY**: AWS 비밀 액세스 키  
  예: `your_aws_secret_key`

- **DB_TYPE**: 데이터베이스 종류 (PostgreSQL 사용)  
  예: `postgres`

- **DB_PORT**: 데이터베이스 포트  
  예: `5432`

- **DB_HOST**: 데이터베이스 호스트  
  예: `localhost`

- **DB_USERNAME**: 데이터베이스 사용자 이름  
  예: `your_db_user`

- **DB_PASSWORD**: 데이터베이스 비밀번호  
  예: `your_db_password`

- **DB_NAME**: 데이터베이스 이름  
  예: `your_db_name`
