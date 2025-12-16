const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error.issues) {
        const errors = {};
        error.issues.forEach((issue) => {
          const field = issue.path.join(".");
          errors[field] = issue.message;
        });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }
  };
};

module.exports = validateRequest;
