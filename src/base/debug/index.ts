(async function (): Promise<void> {

  process.removeAllListeners('warning');

  process.on('uncaughtException', async (error: Error) => {

    logger.send(`${error.stack}`, { type: 2 });
  });

  process.on('unhandledRejection', async (error: Error) => {

    logger.send(`${error.stack}`, { type: 2 });
  });
})();