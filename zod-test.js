const z = require('zod');

const schema = z.object({
  test: z.string().min(8).regex(/[0-9]/)
});

const result = schema.safeParse({ test: "short" });

if (!result.success) {
  console.log(JSON.stringify(result.error.issues, null, 2));
}
