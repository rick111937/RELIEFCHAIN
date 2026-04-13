const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};
module.exports = validate;
