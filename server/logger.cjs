const fs = require('fs');
const path = require('path');
const util = require('util');

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTimestamp(date = new Date()) {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function ensureLogDir() {
  const logDir = path.join(__dirname, '../logs');
  fs.mkdirSync(logDir, { recursive: true });
  return logDir;
}

function serializeArg(arg) {
  if (arg instanceof Error) {
    return arg.stack || `${arg.name}: ${arg.message}`;
  }

  if (typeof arg === 'string') {
    return arg;
  }

  return util.inspect(arg, { depth: 6, colors: false, breakLength: 120 });
}

function createFileWriter(name) {
  const logDir = ensureLogDir();
  const dailyPath = path.join(logDir, `${name}-${formatDate()}.log`);
  const latestPath = path.join(logDir, `${name}.latest.log`);

  fs.writeFileSync(latestPath, '');

  const dailyStream = fs.createWriteStream(dailyPath, { flags: 'a' });
  const latestStream = fs.createWriteStream(latestPath, { flags: 'a' });

  const write = (level, args) => {
    const line = `[${formatTimestamp()}] [${level}] ${args.map(serializeArg).join(' ')}\n`;
    dailyStream.write(line);
    latestStream.write(line);
  };

  const close = () => {
    dailyStream.end();
    latestStream.end();
  };

  return {
    dailyPath,
    latestPath,
    write,
    close,
  };
}

function initServerLogger(name = 'server') {
  const writer = createFileWriter(name);
  const originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  const wrapMethod = (level, originalMethod) => (...args) => {
    writer.write(level, args);
    originalMethod(...args);
  };

  console.log = wrapMethod('INFO', originalConsole.log);
  console.info = wrapMethod('INFO', originalConsole.info);
  console.warn = wrapMethod('WARN', originalConsole.warn);
  console.error = wrapMethod('ERROR', originalConsole.error);

  writer.write('INFO', [`Logger initialized. Daily log: ${writer.dailyPath}`]);

  process.on('exit', writer.close);
  process.on('SIGINT', () => {
    writer.write('INFO', ['Received SIGINT, shutting down logger.']);
    writer.close();
  });
  process.on('SIGTERM', () => {
    writer.write('INFO', ['Received SIGTERM, shutting down logger.']);
    writer.close();
  });
  process.on('uncaughtException', (error) => {
    writer.write('ERROR', ['Uncaught exception:', error]);
  });
  process.on('unhandledRejection', (reason) => {
    writer.write('ERROR', ['Unhandled rejection:', reason]);
  });

  return writer;
}

module.exports = {
  initServerLogger,
};
