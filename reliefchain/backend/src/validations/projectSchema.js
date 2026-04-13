const { z } = require('zod');
exports.createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  targetAmount: z.number().positive(),
});
