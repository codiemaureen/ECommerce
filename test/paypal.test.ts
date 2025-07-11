import { generateAccessToken } from "../lib/paypal";

// test to generate access token from paypal

test('generates a token from paypal', async() => {
 const tokenResponse = await generateAccessToken();
 expect(typeof tokenResponse).toBe('string');
 expect(tokenResponse.length).toBeGreaterThan(0);
})