import { Configuration } from 'log4js';

const log4jsConfig: Configuration = {
  appenders: {
    console: { type: 'console' }, // 콘솔 출력
    file: {
      type: 'file',
      filename: 'logs/application.log', // 로그 파일 저장 위치
      maxLogSize: 10485760, // 최대 파일 크기 (10MB)
      backups: 3, // 백업 파일 갯수
      compress: true, // 압축 사용
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'debug' }, // 디폴트 로거 설정
  },
};

export default log4jsConfig;
