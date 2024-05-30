import {
  JAYPIE,
  jaypieHandler,
  log as publicLogger,
  ConfigurationError,
  UnhandledError,
} from "@jaypie/core";

//
//
// Main
//

const lambdaHandler = (
  handler,
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

  let jaypieFunction;

  return async (event = {}, context = {}, ...args) => {
    if (!name) {
      // If handler has a name, use it
      if (handler.name) {
        name = handler.name;
      } else {
        name = JAYPIE.UNKNOWN;
      }
    }

    // The public logger is also the "root" logger
    publicLogger.tag({ handler: name });

    // Very low-level, sub-trace details
    const libLogger = publicLogger.lib({
      lib: JAYPIE.LIB.LAMBDA,
    });
    libLogger.trace("[jaypie] Lambda init");

    const log = publicLogger.lib({
      level: publicLogger.level,
      lib: JAYPIE.LIB.LAMBDA,
    });

    //
    //
    // Preprocess
    //

    if (!jaypieFunction) {
      jaypieFunction = jaypieHandler(handler, {
        name,
        setup,
        teardown,
        unavailable,
        validate,
      });
    }

    let response;

    try {
      publicLogger.tag({ invoke: context.awsRequestId });

      libLogger.trace("[jaypie] Lambda execution");
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

    // Log response
    log.info.var({ response });

    // Clean up the public logger
    publicLogger.untag("handler");

    //
    //
    // Return
    //

    return response;
  };
};

//
//
// Export
//

export default lambdaHandler;
