import morgan from 'morgan';

const stream = process.stdout;
const skip = () => process.env.NODE_ENV === 'test';

const requestLogger = morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream, skip }
);

export default requestLogger;