import { Hono } from "hono";
import type { CloudflareBindings } from '../types';
import { jwtAuth } from '../middleware/auth';

const apiRoutes = new Hono<{ Bindings: CloudflareBindings; Variables: { user: any } }>();

// Apply JWT authentication middleware to all API routes
apiRoutes.use('/api/*', jwtAuth);

async function callAzureOpenAI(
  env: CloudflareBindings,
  userMessage: string,
  systemPrompt: string
): Promise<{ sanitizedCode?: string, recommendations?: string, error?: string }> {
  const { AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, CLOUDFLARE_AI_GATEWAY_API_KEY } = env;
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !CLOUDFLARE_AI_GATEWAY_API_KEY) {
    return { error: "Missing Azure OpenAI or Cloudflare AI Gateway configuration." };
  }

  const azureBody = {
    "messages": [
      {
        "role": "user", 
        "content": userMessage
      },
      {
        "role": "system",
        "content": systemPrompt
      }
    ]
  };

  console.log('making request to azure');

  const azureRes = await fetch(AZURE_OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-aig-authorization": CLOUDFLARE_AI_GATEWAY_API_KEY,
      "api-key": AZURE_OPENAI_API_KEY,
    },
    body: JSON.stringify(azureBody),
  });

  console.log('azure response status: '+ azureRes.status + ' ' + azureRes.statusText);

  if (azureRes.status !== 200) {
    return { error: "Failed to generate response from Azure OpenAI: " + azureRes.status + ' ' + azureRes.statusText };
  }

  const responseBody = await azureRes.json() as any;
  const content = responseBody.choices?.[0]?.message?.content;

  if (!content || content === 'ERROR_SANITIZATION_FAILED') {
    return { error: "Failed to generate sanitized code from Azure OpenAI." };
  }

  // Try to parse as JSON for recommendations endpoint, fallback to string for legacy
  try {
    const parsed = JSON.parse(content);
    return {
      sanitizedCode: parsed.sanitizedCode ?? parsed.code ?? undefined,
      recommendations: parsed.recommendations
    };
  } catch {
    // If not JSON, treat as plain sanitized code
    return { sanitizedCode: content };
  }
}

apiRoutes.post("/api/generate", async (c) => {
  const body = await c.req.json();
  const systemPrompt = "You are an AI coding assistant. Your task is to help the user sanitize and anonymize any sensitive company or personal data from the provided code sample or script. Only return the code or script with all sensitive and identifying information removed or replaced with generic placeholders. Do not include any additional commentary or explanation in your response. Do not format the response in any way; especially do not use markdown or any other formatting that was not present in the original input. If you are unable to successfully sanitize and anonymize the code or script, respond only with the error code: ERROR_SANITIZATION_FAILED.";

  const result = await callAzureOpenAI(c.env, body.message, systemPrompt);

  if (result.error || !result.sanitizedCode) {
    return c.json({ error: result.error ?? "Unknown error" }, 502);
  }

  return c.json({
    originalCode: body.message,
    sanitizedCode: result.sanitizedCode
  });
});

apiRoutes.post("/api/generate_with_recommendations", async (c) => {
  const body = await c.req.json();
  const systemPrompt = `You are an AI coding assistant. Your task is to help the user to secure, sanitize and anonymize any sensitive company or personal data from the provided code sample or script. Only return a JSON object with the following keys:
- "sanitizedCode": the code or script with all sensitive and identifying information removed or replaced with generic placeholders, and, where applicable, replace the original implementation with a more secure implementation using environment variables or configuration files, for example. The functionality of the code should not be changed. Do not include any additional commentary or formatting.
- "recommendations" (optional): a string containing recommendations for even further code improvements considering our already imporoved version, using HTML formatting with Tailwind CSS v4 classes applied to the entire content for visual appeal. Ensure that paragraphs and any code examples have sufficient vertical spacing (for example, by adding "mb-4" or similar Tailwind spacing classes to paragraphs and blocks). Recommendations should include relevant and applicable examples and code snippets using <pre> and <code> tags with appropriate Tailwind styling. You can use subtle and concise sub-headings for each recommendation. Style the sub-headings with Tailwind CSS v4 classes for visual appeal. Do not use lists.
Only the "recommendations" string may use HTML formatting, but "sanitizedCode" must not contain any HTML or additional formatting.
If you are unable to successfully sanitize and anonymize the code or script, respond only with the error code: ERROR_SANITIZATION_FAILED.`;

  const result = await callAzureOpenAI(c.env, body.message, systemPrompt);

  if (result.error || !result.sanitizedCode) {
    return c.json({ error: result.error ?? "Unknown error" }, 502);
  }

  return c.json({
    originalCode: body.message,
    sanitizedCode: result.sanitizedCode,
    ...(result.recommendations ? { recommendations: result.recommendations } : {})
  });
});

export { apiRoutes } 