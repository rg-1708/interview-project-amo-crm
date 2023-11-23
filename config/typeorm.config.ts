module.exports = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  database: 'interview_nest_backend',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  useUnifiedTopology: true,
};
