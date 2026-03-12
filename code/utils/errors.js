class NotFoundError extends Error {
  constructor(resource, identifier) {
    super(`${resource} not found: ${identifier}`);
    this.name = 'NotFoundError';
    this.status = 404;
    this.resource = resource;
    this.identifier = identifier;
  }
}

class ValidationError extends Error {
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.fields = fields;
  }
}

class ServiceError extends Error {
  constructor(message, { service, operation, cause } = {}) {
    super(message);
    this.name = 'ServiceError';
    this.status = 502;
    this.service = service;
    this.operation = operation;
    this.cause = cause;
  }
}

const handleRouteError = (res, error) => {
  const status = error.status || 500;
  const payload = {
    error: error.name || 'InternalError',
    message: error.message,
  };

  if (error.fields) payload.fields = error.fields;
  if (error.resource) payload.resource = error.resource;

  res.status(status).json(payload);
};

module.exports = { NotFoundError, ValidationError, ServiceError, handleRouteError };
