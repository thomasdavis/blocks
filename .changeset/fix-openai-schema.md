---
"@blocksai/ai": patch
---

Fix OpenAI structured output schema validation error in domain validator

OpenAI's structured output requires ALL properties to be in the JSON schema's `required` array. The domain validator was using `.optional()` for `file` and `summary` fields, which excluded them from `required` and caused the error:

"Invalid schema for response_format 'response': Missing 'file'"

Changed all optional fields to required strings with descriptive `.describe()` annotations. The AI will return empty strings for file-agnostic issues.
