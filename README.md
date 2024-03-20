# Jaypie Lambda 🐦‍⬛🍵

AWS Lambda Jaypie Handler

## 🐦‍⬛ Introduction

Jaypie is an opinionated approach to application development centered around JavaScript and the JSON:API specification in an event-driven architecture.

## 📋 Usage

`@jaypie/lambda` is an optional package that should be installed alongside the main `jaypie` package.

### Installation

```bash
npm install jaypie @jaypie/lambda
```

### Example

```javascript
const { lambdaHandler } = require("@jaypie/lambda");

const handler = lambdaHandler(async({event}) => {
  // await new Promise(r => setTimeout(r, 2000));
  // log.debug("Hello World");
  return "Hello World";
}, { name: "example"});
```

## 📝 Changelog

| Date       | Version | Summary        |
| ---------- | ------- | -------------- |
|  3/19/2024 |   1.0.0 | First publish with `@jaypie/core@1.0.0` |
|  3/16/2024 |   0.1.0 | Initial deploy |
|  3/15/2024 |   0.0.1 | Initial commit |

## 📜 License

Published by Finlayson Studio. All rights reserved
