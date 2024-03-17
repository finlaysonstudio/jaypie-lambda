import {
  JAYPIE,
  jaypieHandler,
  log as defaultLogger,
  moduleLogger as defaultModuleLogger,
  ConfigurationError,
  UnhandledError,
} from "@jaypie/core";

//
//
// Main
//

const lambdaHandler = (
  handler,
  // We rely on jaypieHandler for all defaults... _except_ log
  { name, setup, teardown, unavailable, validate } = {},
) => {
  //
  //
  // Validate
  //

  if (typeof handler !== "function") {
    throw new ConfigurationError(
      "The handler responding to the request encountered a configuration error",
    );
  }

  //
  //
  // Setup
  //

  const jaypieLogger = defaultModuleLogger.with({
    handler: name || handler.name || JAYPIE.UNKNOWN,
    logger: JAYPIE.LAYER.LAMBDA,
  });
  const moduleLogger = jaypieLogger.with({
    layer: JAYPIE.LAYER.LAMBDA,
    lib: JAYPIE.LIB.LAMBDA,
  });
  moduleLogger.trace("[jaypie] Lambda init");

  // This will be the public logger
  const log = defaultLogger.with({
    handler: name || handler.name || JAYPIE.UNKNOWN,
    layer: JAYPIE.LAYER.HANDLER,
  });

  //
  //
  // Preprocess
  //

  const jaypieFunction = jaypieHandler(handler, {
    log,
    moduleLogger: jaypieLogger,
    name,
    setup,
    teardown,
    unavailable,
    validate,
  });

  return async (event = {}, context = {}, ...args) => {
    let response;

    try {
      jaypieLogger.tag({ invoke: context.awsRequestId });
      log.tag({ invoke: context.awsRequestId });
      moduleLogger.tag({ invoke: context.awsRequestId });

      moduleLogger.trace("[jaypie] Lambda execution");
      log.info.var({ event });

      //
      //
      // Process
      //

      response = await jaypieFunction(event, context, ...args);

      //
      //
      // Error Handling
      //
    } catch (error) {
      // Jaypie or "project" errors are intentional and should be handled like expected cases
      if (error.isProjectError) {
        log.debug("Caught jaypie error");
        log.var({ jaypieError: error });
        response = error.json();
      } else {
        // Otherwise, flag unhandled errors as fatal
        log.fatal("Caught unhandled error");
        log.var({ unhandledError: error.message });
        response = UnhandledError().json();
      }
    }

    //
    //
    // Postprocess
    //

    // TODO: API Gateway proxy response

    //
    //
    // Return
    //

    log.info.var({ response });
    return response;
  };
};

//
//
// Export
//

export default lambdaHandler;
